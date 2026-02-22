from django.db import models

class Server(models.Model):
    name = models.CharField(max_length=100, null=False)
    ip_address = models.GenericIPAddressField(protocol='both', unpack_ipv4=True, null=False)
    location = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    expiration_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name