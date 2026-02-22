from ninja.errors import HttpError
from functools import wraps

def get_user_role(user):
    if hasattr(user, 'profile'):
        return user.profile.role
    return 'viewer'  

def role_required(required_role):
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            user_role = get_user_role(request.auth)
            roles_hierarchy = ['viewer', 'editor', 'admin']
            if roles_hierarchy.index(user_role) < roles_hierarchy.index(required_role):
                raise HttpError(403, "Permission denied")
            return func(request, *args, **kwargs)
        return wrapper
    return decorator