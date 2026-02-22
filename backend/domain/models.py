from django.db import models

class Domain(models.Model):
    name = models.CharField(max_length=100, null=False)
    register = models.CharField(max_length=100, null=False)
    status = models.CharField(max_length=20, choices=[('active', 'Active'), ('expired', 'Expired'), ('parked', 'Parked'), 
                                                      ('expiring_soon', 'Expiring Soon')], default='active')
    expiration_date = models.DateField()
    description= models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return repr(self.name)
    
    
class DomainAction(models.Model):
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE, related_name='actions')
    docs = models.FileField(upload_to='docs/', blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Action on {self.domain.name}: {self.description}, created at {self.created_at}"