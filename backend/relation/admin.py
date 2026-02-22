from django.contrib import admin
from django.contrib.contenttypes.admin import GenericTabularInline
from .models import InfrastructureLink
from domain.models import Domain
from server.models import Server
from financial.models import FinancialRecord as Financial
from certificate.models import Certificate
from password.models import Password
from website.models import Website

class InfrastructureInline(GenericTabularInline):
    model = InfrastructureLink
    ct_field = "source_type"
    ct_fk_field = "source_id"
    extra = 1
    verbose_name = "ارتباط با تجهیزات دیگر"
    verbose_name_plural = "ارتباطات زیرساختی"

def force_register(model, admin_class):
    if admin.site.is_registered(model):
        admin.site.unregister(model)
    admin.site.register(model, admin_class)

class ServerAdmin(admin.ModelAdmin):
    inlines = [InfrastructureInline]

class DomainAdmin(admin.ModelAdmin):
    inlines = [InfrastructureInline]

class FinancialAdmin(admin.ModelAdmin):
    inlines = [InfrastructureInline]

class CertificateAdmin(admin.ModelAdmin):
    inlines = [InfrastructureInline]

class PasswordAdmin(admin.ModelAdmin): 
    inlines = [InfrastructureInline]

class WebsiteAdmin(admin.ModelAdmin):
    inlines = [InfrastructureInline]

force_register(Server, ServerAdmin)
force_register(Domain, DomainAdmin)
force_register(Financial, FinancialAdmin)
force_register(Certificate, CertificateAdmin)
force_register(Password, PasswordAdmin)
force_register(Website, WebsiteAdmin)

@admin.register(InfrastructureLink)
class InfrastructureLinkAdmin(admin.ModelAdmin):
    list_display = ('source_obj', 'target_obj', 'link_label')