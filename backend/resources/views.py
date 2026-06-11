from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from notifications.models import Notification
from .models import Resource
from .serializers import ResourceSerializer


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    filterset_fields = ['branch', 'semester', 'subject', 'file_type', 'status', 'uploaded_by', 'uploaded_by__university', 'uploaded_by__college']
    search_fields = ['title', 'description', 'subject', 'tags']
    ordering_fields = ['created_at', 'downloads', 'avg_rating']

    def get_permissions(self):
        if self.action in ['list', 'retrieve', 'download']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user and user.is_authenticated:
            if user.role == 'admin' or user.is_staff:
                return Resource.objects.all()
            from django.db.models import Q
            if user.role == 'faculty':
                # Faculty can see:
                # - Approved resources (all universities)
                # - Resources uploaded by themselves
                # - Any resources uploaded by students of their own university
                return Resource.objects.filter(
                    Q(status='approved') |
                    Q(uploaded_by=user) |
                    Q(uploaded_by__university=user.university)
                )
            return Resource.objects.filter(Q(status='approved') | Q(uploaded_by=user))
        return Resource.objects.filter(status='approved')

    def perform_create(self, serializer):
        resource = serializer.save(uploaded_by=self.request.user, status='approved')
        
        # Reward uploader with 10 points immediately
        uploader = self.request.user
        uploader.points += 10
        uploader.save(update_fields=['points'])
        
        # Notify faculty members of the same university about the new resource!
        if uploader.university:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            faculties = User.objects.filter(role='faculty', university=uploader.university)
            for faculty in faculties:
                Notification.objects.create(
                    user=faculty,
                    message=f"New study material '{resource.title}' has been uploaded by student {uploader.username}.",
                    resource=resource
                )

    def destroy(self, request, *args, **kwargs):
        resource = self.get_object()
        if resource.uploaded_by != request.user and not (request.user.role == 'admin' or request.user.is_staff):
            return Response({'detail': 'You do not have permission to delete this resource.'}, status=status.HTTP_403_FORBIDDEN)
        
        # Deduct 10 points if the resource was approved before deletion
        if resource.status == 'approved':
            uploader = resource.uploaded_by
            uploader.points = max(0, uploader.points - 10)
            uploader.save(update_fields=['points'])

        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def bookmark(self, request, pk=None):
        resource = self.get_object()
        if resource.bookmarked_by.filter(id=request.user.id).exists():
            resource.bookmarked_by.remove(request.user)
            bookmarked = False
        else:
            resource.bookmarked_by.add(request.user)
            bookmarked = True
        return Response({'bookmarked': bookmarked}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.AllowAny])
    def download(self, request, pk=None):
        resource = self.get_object()
        resource.downloads += 1
        resource.save(update_fields=['downloads'])
        
        # Build absolute download URL
        file_url = resource.file.url
        if not file_url.startswith('http'):
            file_url = request.build_absolute_uri(file_url)

        return Response({'download_url': file_url}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], permission_classes=[permissions.IsAuthenticated])
    def approve(self, request, pk=None):
        user = request.user
        resource = self.get_object()
        
        is_faculty_for_uploader = (
            user.role == 'faculty' and 
            user.university and 
            user.university == resource.uploaded_by.university
        )
        if not (user.role == 'admin' or user.is_staff or is_faculty_for_uploader):
            return Response({'detail': 'You do not have permission to approve resources.'}, status=status.HTTP_403_FORBIDDEN)
        
        status_val = request.data.get('status')
        if status_val not in ['approved', 'rejected', 'pending']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        old_status = resource.status
        resource.status = status_val
        resource.save(update_fields=['status'])

        # Notify uploader
        msg = f"Your resource '{resource.title}' has been {status_val}."
        Notification.objects.create(
            user=resource.uploaded_by,
            message=msg,
            resource=resource
        )

        # Reward uploader with 10 points on approval
        points_awarded = False
        if status_val == 'approved' and old_status != 'approved':
            uploader = resource.uploaded_by
            uploader.points += 10
            uploader.save(update_fields=['points'])
            points_awarded = True

        return Response({
            'status': resource.status,
            'points_awarded': points_awarded
        }, status=status.HTTP_200_OK)
