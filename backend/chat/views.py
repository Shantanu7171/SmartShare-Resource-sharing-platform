from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import ChatMessage, ChatClear
from .serializers import ChatMessageSerializer

class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return True
        # Write/delete permissions are only allowed to the owner or an admin
        return (
            obj.user == request.user or 
            request.user.role == 'admin' or 
            request.user.is_staff or 
            request.user.is_superuser
        )

class ChatMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ChatMessageSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        # Check if the user has cleared their chat
        chat_clear = getattr(user, 'chat_clear', None)
        if chat_clear:
            user_chat_messages = ChatMessage.objects.filter(created_at__gt=chat_clear.cleared_at)
        else:
            user_chat_messages = ChatMessage.objects.filter(created_at__gte=user.date_joined)
            
        # Retrieve the IDs of the last 50 messages (newest first)
        latest_ids = user_chat_messages.values_list('id', flat=True).order_by('-created_at')[:50]
        # Return those messages ordered chronologically (oldest first)
        return ChatMessage.objects.filter(id__in=latest_ids).order_by('created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['delete'], url_path='clear')
    def clear_chat(self, request):
        user = request.user
        # Create or update the ChatClear entry for the current user
        chat_clear, created = ChatClear.objects.get_or_create(user=user)
        chat_clear.cleared_at = timezone.now()
        chat_clear.save()
        return Response({"detail": "Your chat history has been cleared successfully."}, status=status.HTTP_200_OK)

