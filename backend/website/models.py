from django.db import models

class Website(models.Model):
    url = models.URLField(unique=True)
    status = models.CharField(max_length=20, choices=[('up', 'Up'), ('down', 'Down')], default='down')       
    last_checked = models.DateTimeField(auto_now=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.url