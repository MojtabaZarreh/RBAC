from django.db import models

class FinancialRecord(models.Model):
    subject = models.CharField(max_length=255)
    record_date = models.CharField(max_length=10)  # Storing as string in 'YYYY/MM/DD' format
    description = models.TextField(blank=True, null=True)
    attachment = models.JSONField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return repr(self.subject)