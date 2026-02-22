from django.db import models

class Password(models.Model):
    label = models.CharField(max_length=100, unique=True)
    username = models.CharField(max_length=100)
    password = models.CharField(max_length=100)
    url = models.URLField(max_length=200, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.label