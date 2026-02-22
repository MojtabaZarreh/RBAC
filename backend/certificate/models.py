from django.db import models

class Certificate(models.Model):
    name = models.CharField(max_length=255, unique=True)
    issuer = models.CharField(max_length=255)
    expiration_date = models.DateField()
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name