from rest_framework import serializers
from users.serializers import UserProfileSerializer
from .models import ChatMessage

class ChatMessageSerializer(serializers.ModelSerializer):
    user = UserProfileSerializer(read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id', 'user', 'message', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
