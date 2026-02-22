from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import secrets
from datetime import timedelta

class Permission(models.TextChoices):
    VIEWER = 'viewer', 'Viewer'
    EDITOR = 'editor', 'Editor'
    ADMIN = 'admin', 'Admin'


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=10, choices=Permission.choices, default=Permission.VIEWER)
    fullname = models.CharField(max_length=120, default="کاربر بدون نام")
    company = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username} ({self.role})"


class APIKey(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="api_keys")
    key = models.CharField(max_length=50, unique=True)
    created = models.DateTimeField(auto_now_add=True)
    expires = models.DateTimeField()
    active = models.BooleanField(default=True)

    @staticmethod
    def create_key(user, days_valid=5):
        key = secrets.token_hex(16)
        expires = timezone.now() + timedelta(days=days_valid)
        return APIKey.objects.create(user=user, key=key, expires=expires)
    
    @staticmethod
    def revoke_key(user):
        try:
            api_key = APIKey.objects.filter(user=user, active=True)
            if api_key.exists():
                api_key.delete()
                return True
        except APIKey.DoesNotExist:
            return False
