from ninja.security import HttpBearer
from django.utils import timezone
from .models import APIKey

class APIKeyAuth(HttpBearer):
    def authenticate(self, request, token):
        try:
            api_key = APIKey.objects.get(key=token, active=True)
            if api_key.expires < timezone.now():
                return None  
            return api_key.user  
        except APIKey.DoesNotExist:
            return None
    