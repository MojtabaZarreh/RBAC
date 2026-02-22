from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType

class InfrastructureLink(models.Model):
    source_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name='source_links')
    source_id = models.PositiveIntegerField()
    source_obj = GenericForeignKey('source_type', 'source_id')

    target_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, related_name='target_links')
    target_id = models.PositiveIntegerField()
    target_obj = GenericForeignKey('target_type', 'target_id')

    link_label = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.source_obj} -> {self.target_obj}"