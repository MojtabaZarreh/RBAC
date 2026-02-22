from django.contrib import admin
from .models import Domain, DomainAction

admin.site.register(Domain)
admin.site.register(DomainAction)