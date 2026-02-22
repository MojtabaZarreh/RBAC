from ninja import Router, Schema
from ninja.errors import HttpError
from account.auth import APIKeyAuth
from password.models import Password
from typing import Optional
from datetime import datetime

api = Router(tags=["Password"], auth=APIKeyAuth())

class PasswordSchemaIn(Schema):
    label: str
    username: str
    password: str
    url: str = None
    notes: str = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

class PasswordSchemaOut(Schema):
    id: int
    label: str
    username: str
    password: str
    url: str = None
    notes: str = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

@api.get("/passwords", response=list[PasswordSchemaOut])
def password_list(request):
    passwords = Password.objects.all()
    return [PasswordSchemaOut.from_orm(pwd) for pwd in passwords]


@api.post("/passwords", response=PasswordSchemaOut)
def create_password(request, password: PasswordSchemaIn):
    pwd = Password.objects.create(
        **password.dict(
            exclude_unset=True
        )
    )
    return PasswordSchemaOut.from_orm(pwd)

@api.put("/passwords/{password_id}", response=PasswordSchemaOut)
def update_password(request, password_id: int, password: PasswordSchemaIn):
    try:
        pwd = Password.objects.get(id=password_id)
    except Password.DoesNotExist:
        raise HttpError(404, "Password not found")
    
    for attr, value in password.dict(exclude_unset=True).items():
        setattr(pwd, attr, value)
    pwd.save()
    return PasswordSchemaOut.from_orm(pwd)

@api.delete("/passwords/{password_id}")
def delete_password(request, password_id: int):
    try:
        pwd = Password.objects.get(id=password_id)
    except Password.DoesNotExist:
        raise HttpError(404, "Password not found")
    pwd.delete()
    return {"success": True}