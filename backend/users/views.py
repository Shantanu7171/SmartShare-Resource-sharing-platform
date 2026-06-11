from django.contrib.auth import get_user_model
from django.db.models import Count, Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import LoginSerializer, RegisterSerializer, UserProfileSerializer, AdminUserSerializer

User = get_user_model()


def send_otp_email_async(user, otp_code, purpose="verification"):
    import threading
    from django.core.mail import send_mail
    from django.conf import settings

    # Print to console for easy testing during development
    print(f"\n==================================================")
    print(f"[DEBUG OTP] Purpose: {purpose.upper()}")
    print(f"User: {user.username} | Email: {user.email}")
    print(f"OTP Code: {otp_code}")
    print(f"==================================================\n")

    def run_send():
        if purpose == "password_reset":
            subject = 'Password Reset OTP - Smart College Resource Sharing Platform'
            message = (
                f"Hello {user.username},\n\n"
                f"We received a request to reset your password.\n"
                f"Please use the following 6-digit One-Time Password (OTP) to reset your password:\n\n"
                f"   OTP Code: {otp_code}\n\n"
                f"This code is valid for 10 minutes.\n\n"
                f"If you did not request this, please ignore this email.\n"
            )
        else:
            subject = 'Verify Your Smart College Resource Sharing Platform Account'
            message = (
                f"Welcome to Smart College Resource Sharing Platform, {user.username}!\n\n"
                f"Your account registration is almost complete.\n"
                f"Please use the following 6-digit One-Time Password (OTP) to verify your email address:\n\n"
                f"   OTP Code: {otp_code}\n\n"
                f"This code is valid for 10 minutes.\n\n"
                f"If you did not request this, please ignore this email.\n"
            )
        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email])
            print(f"Email sent successfully to {user.email}")
        except Exception as e:
            print(f"FAILED TO SEND OTP EMAIL to {user.email}: {e}")

    threading.Thread(target=run_send).start()



class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        username = request.data.get('username')

        # Clean up any unverified (inactive) users with same email or username
        if email:
            User.objects.filter(email__iexact=email, is_active=False).delete()
        if username:
            User.objects.filter(username=username, is_active=False).delete()

        return super().post(request, *args, **kwargs)



class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        user_data = UserProfileSerializer(user, context={'request': request}).data
        return Response({
            'user': user_data,
            'access': serializer.validated_data['access'],
            'refresh': serializer.validated_data['refresh']
        }, status=status.HTTP_200_OK)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class LeaderboardView(generics.ListAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        # Exclude administrators/staff, annotate with upload counts, and return top active contributors
        return User.objects.exclude(
            role='admin'
        ).exclude(
            is_staff=True
        ).exclude(
            is_superuser=True
        ).annotate(
            num_uploads=Count('uploaded_resources')
        ).filter(
            Q(points__gt=0) | Q(num_uploads__gt=0)
        ).order_by('-points', '-num_uploads')[:10]

    def list(self, request, *args, **kwargs):
        # Ensure we return plain list of top 10 without default pagination
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class MyBookmarksView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        from resources.serializers import ResourceSerializer
        return ResourceSerializer

    def get_queryset(self):
        # Resource model has bookmarked_by ManyToMany to User with related_name 'bookmarks'
        return self.request.user.bookmarks.filter(status='approved')


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer

    def get_permissions(self):
        if self.request.method in ['GET', 'DELETE']:
            return [permissions.IsAuthenticated()]
        return [permissions.IsAdminUser()]

    def retrieve(self, request, *args, **kwargs):
        from rest_framework.exceptions import PermissionDenied
        instance = self.get_object()
        user = request.user
        
        if user.role == 'admin' or user.is_staff:
            return super().retrieve(request, *args, **kwargs)
        
        if user.role == 'faculty' and instance.role == 'student' and instance.university == user.university:
            if not user.college or instance.college == user.college:
                return super().retrieve(request, *args, **kwargs)
                
        if instance == user:
            return super().retrieve(request, *args, **kwargs)
            
        raise PermissionDenied("You do not have permission to view this profile.")

    def perform_destroy(self, instance):
        from rest_framework.exceptions import PermissionDenied, ValidationError
        user = self.request.user
        if instance == user:
            raise ValidationError("You cannot delete your own account.")
        
        if user.role == 'admin' or user.is_staff:
            instance.delete()
            return
        
        if user.role == 'faculty' and instance.role == 'student' and instance.university == user.university:
            if not user.college or instance.college == user.college:
                instance.delete()
                return
                
        raise PermissionDenied("You do not have permission to delete this user.")


class AdminUserListView(generics.ListAPIView):
    queryset = User.objects.all().order_by('username')
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]
    pagination_class = None




class RegisteredCollegesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        colleges = User.objects.exclude(college='').values_list('college', flat=True).distinct()
        colleges = sorted(list(set(colleges)))
        return Response(colleges)


class RegisteredUniversitiesView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        universities = User.objects.exclude(university='').values_list('university', flat=True).distinct()
        universities = sorted(list(set(universities)))
        return Response(universities)


class FacultyStudentListView(generics.ListAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        if user.role != 'faculty':
            return User.objects.none()
        
        queryset = User.objects.filter(role='student', university=user.university)
        if user.college:
            queryset = queryset.filter(college=user.college)
        return queryset.order_by('username')


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        from rest_framework_simplejwt.tokens import RefreshToken
        from .models import EmailOTP
        
        email = request.data.get('email')
        otp_code = request.data.get('otp')

        if not email or not otp_code:
            return Response({"detail": "Both email and OTP code are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({"detail": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)

        if user.is_active:
            return Response({"detail": "Account is already verified and active."}, status=status.HTTP_400_BAD_REQUEST)

        # Get latest OTP for this user
        otp_record = user.otps.order_by('-created_at').first()
        if not otp_record:
            return Response({"detail": "No OTP found for this user. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.is_expired():
            return Response({"detail": "OTP has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.otp_code != otp_code:
            return Response({"detail": "Invalid OTP code."}, status=status.HTTP_400_BAD_REQUEST)

        # Verify and activate user
        user.is_active = True
        user.save()

        # Clean up OTP records
        user.otps.all().delete()

        # Generate login tokens to automatically authenticate them
        refresh = RefreshToken.for_user(user)
        user_data = UserProfileSerializer(user, context={'request': request}).data

        return Response({
            'detail': 'Email verified successfully!',
            'user': user_data,
            'access': str(refresh.access_token),
            'refresh': str(refresh)
        }, status=status.HTTP_200_OK)


class ResendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        import random
        from django.core.mail import send_mail
        from django.conf import settings
        from .models import EmailOTP

        email = request.data.get('email')
        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({"detail": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)

        if user.is_active:
            return Response({"detail": "Account is already verified and active."}, status=status.HTTP_400_BAD_REQUEST)

        # Generate and save new OTP code
        otp_code = str(random.randint(100000, 999999))
        EmailOTP.objects.create(user=user, otp_code=otp_code)

        # Send mail
        send_otp_email_async(user, otp_code, purpose="verification")

        return Response({"detail": "New OTP code sent to your email."}, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        import random
        from django.core.mail import send_mail
        from django.conf import settings
        from .models import EmailOTP

        email = request.data.get('email')
        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({"detail": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)

        # Generate OTP
        otp_code = str(random.randint(100000, 999999))
        EmailOTP.objects.create(user=user, otp_code=otp_code)

        # Send Email
        send_otp_email_async(user, otp_code, purpose="password_reset")

        return Response({"detail": "Password reset OTP sent to your email."}, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        otp_code = request.data.get('otp')
        new_password = request.data.get('new_password')

        if not email or not otp_code or not new_password:
            return Response({"detail": "Email, OTP, and new password are required."}, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 6:
            return Response({"detail": "Password must be at least 6 characters long."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return Response({"detail": "User with this email does not exist."}, status=status.HTTP_404_NOT_FOUND)

        # Get latest OTP for this user
        otp_record = user.otps.order_by('-created_at').first()
        if not otp_record:
            return Response({"detail": "No OTP record found. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.is_expired():
            return Response({"detail": "OTP has expired. Please request a new one."}, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.otp_code != otp_code:
            return Response({"detail": "Invalid OTP code."}, status=status.HTTP_400_BAD_REQUEST)

        # Set new password
        user.set_password(new_password)
        user.is_active = True
        user.save()

        # Delete all OTP records for user
        user.otps.all().delete()

        return Response({"detail": "Password reset successfully! You can now log in with your new password."}, status=status.HTTP_200_OK)


