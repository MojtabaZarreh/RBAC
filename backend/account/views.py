from ninja import Schema, File, Form, UploadedFile
from django.contrib.auth import authenticate
from .models import APIKey, Profile, Permission
from .auth import APIKeyAuth
from django.contrib.auth.models import User
from typing import Optional
from .permission import role_required
from django.shortcuts import get_object_or_404
from django.db import transaction
from ninja import Router
from ninja.responses import Response

api = Router(tags=["Account"]) 

class LoginSchema(Schema):
    username: str
    password: str

class APIKeyOut(Schema):
    username: str
    key: str
    expires: str

@api.post("/login", response=APIKeyOut)
def login(request, data: LoginSchema):
    user = authenticate(username=data.username, password=data.password)
    if not user:
        return Response({"detail": "Invalid credentials"}, status=401)
    api_key = APIKey.create_key(user)
    return {"username": str(api_key.user),
            "role": user.profile.role,
            "fullname": user.profile.fullname,
            "key": api_key.key, 
            "expires": api_key.expires.isoformat()}
    
@api.post("/logout", auth=APIKeyAuth())
def logout(request):
    user = request.auth
    if APIKey.revoke_key(user):
        return Response({"detail": "Successfully logged out."}, status=200)
    else:
        return Response({"detail": "No active API key found."}, status=400)

class RegisterResponseIn(Schema):
    company: str
    email: str
    password: str
    fullname: str

class RegisterResponseOut(Schema):
    username: str
    role: str
    key: str
    
@api.post("/register", response=RegisterResponseOut)
def register(request, data: RegisterResponseIn):
    try:
        with transaction.atomic():
            if Profile.objects.filter(role=Permission.ADMIN).exists():
                return Response({"detail": "Admin user already exists."}, status=400)
    
            user = User.objects.create_user(
                username=data.email,
                email=data.email,
                password=data.password
            )
            
            Profile.objects.create(
                user = user,
                role = Permission.ADMIN,
                company = data.company,
                fullname = data.fullname
            )

            api_key = APIKey.create_key(user)
            return {"username": user.username,
                    "role": user.profile.role,
                    "key": api_key.key}
    except Exception as e:
        return Response({"detail": str(e)}, status=500)

class ProfileSchemaOut(Schema):
    company: str
    username: str
    role: str
    email: str
    fullname: Optional[str] = None
    city: Optional[str] = None
    logo: Optional[str] = None
    
class UpdateProfileIn(Schema):
    company: Optional[str] = None
    city: Optional[str] = None
    logo: Optional[UploadedFile] = None
    
@api.get("/profile", auth=APIKeyAuth(), response=ProfileSchemaOut)
def profile(request):
    profile = request.auth.profile
    if profile.role == Permission.ADMIN:
        data = {
            "company": profile.company,
            "username": profile.user.username,
            "fullname": profile.fullname,
            "email": profile.user.email,
            "role": profile.role,
            "city": profile.city,
            "logo": profile.logo.url if profile.logo else None
        }
    else:
        admin_profile = Profile.objects.filter(role=Permission.ADMIN).first()
        data = {
            "username": profile.user.username,
            "fullname": profile.fullname,
            "email": profile.user.email,
            "role": profile.role,
            "company": admin_profile.company if admin_profile else None,
            "city": admin_profile.city if admin_profile else None,
            "logo": admin_profile.logo.url if admin_profile and admin_profile.logo else None,
        }
    return data

@api.put("/profile/admin", auth=APIKeyAuth())
@role_required('admin')
def update_profile(request,
                email: Optional[str] = Form(None),
                fullname: Optional[str] = Form(None),
                password: Optional[str] = Form(None),
                company: Optional[str] = Form(None), 
                city: Optional[str] = Form(None), 
                logo: Optional[UploadedFile] = File(None)):
    
    profile = request.auth.profile
    if email is not None:
        if User.objects.filter(email=email).exclude(id=profile.user.id).exists():
            return {"error": "email already exists."}
        profile.user.email = email
        profile.user.username = email
    if fullname is not None:
        profile.fullname = fullname
    if password is not None:
        profile.user.set_password(password)
    if company is not None:
        profile.company = company
    if city is not None:
        profile.city = city
    if logo is not None:
        profile.logo.save(logo.name, logo, save=False)
    profile.user.save()
    profile.save()
    return Response({"detail": "Profile updated successfully."}, status=200)

class CreateUserSchema(Schema):
    email: str
    password: str
    fullname: str
    role: str
    
class UpdateUserProfileIn(Schema):
    fullname: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    
class UserListSchemaOut(Schema):
    username: str
    fullname: str
    role: str

@api.post("/create-user", auth=APIKeyAuth())
@role_required('admin')
def create_user(request, data: CreateUserSchema):
    
    if data.role not in [Permission.VIEWER, Permission.EDITOR]:
        return Response({"detail": "Invalid role provided."}, status=400)
    if User.objects.filter(username=data.email).exists():
        return Response({"detail": "User with this email already exists."}, status=400)
    
    user = User.objects.create_user(
        username=data.email,
        email=data.email,
        password=data.password
    )
    Profile.objects.create(
        user = user,
        role = data.role,
        fullname = data.fullname
    )
    return Response({"detail": "User created successfully."}, status=200)

@api.put("/profile/user", auth=APIKeyAuth())
@role_required('viewer')
def update_user_profile(request, data: UpdateUserProfileIn):
    profile = request.auth.profile
    
    if data.fullname is not None:
        profile.fullname = data.fullname

    if data.email is not None:
        if User.objects.filter(email=data.email).exclude(id=profile.user.id).exists():
            return {"error": "email already exists."}
        profile.user.email = data.email
        profile.user.username = data.email

    if data.password is not None:
        profile.user.set_password(data.password)

    profile.user.save()
    profile.save()
    return Response({"detail": "User profile updated successfully."}, status=200)

@api.put("/change-role/{target_user}", auth=APIKeyAuth())
@role_required('admin')
def change_role(request, target_user: str, new_role: str):
    user = get_object_or_404(User, username=target_user)

    valid_roles = [Permission.VIEWER, Permission.EDITOR]
    if new_role not in valid_roles:
        return Response({"detail": "Invalid role provided."}, status=400)
    
    profile = user.profile
    profile.role = new_role
    profile.save()  
    return Response({"detail": f"Role for {user} updated to {new_role}."}, status=200)

@api.get("/users", auth=APIKeyAuth(), response=list[UserListSchemaOut])
@role_required('viewer')
def list_users(request):
    users = User.objects.all().select_related('profile')
    result = []

    for user in users:
        if not hasattr(user, "profile"):
            continue

        result.append({
            "username": user.username,
            "fullname": user.profile.fullname,
            "role": user.profile.role
        })

    return result

@api.delete("/delete-user/{target_user}", auth=APIKeyAuth())
@role_required('admin')
def change_role(request, target_user: str):
    user = get_object_or_404(User, username=target_user)
    user.delete()
    return Response({"detail": f"User successfully deleted."}, status=202)