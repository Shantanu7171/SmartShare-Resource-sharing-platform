from rest_framework import serializers

from resources.serializers import ResourceSerializer
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    # Optional resource detail serialization
    resource = ResourceSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'is_read', 'resource', 'created_at']
        read_only_fields = ['id', 'user', 'message', 'resource', 'created_at']
