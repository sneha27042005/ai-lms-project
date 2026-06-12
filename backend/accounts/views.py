from rest_framework import status, generics, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import action
from django.contrib.auth import authenticate, get_user_model
from django.db.models import Q, Count, Avg
from .serializers import (RegisterSerializer, UserSerializer, CourseDiscussionSerializer, 
                          DiscussionCommentSerializer, NotificationPreferenceSerializer, 
                          StudentAchievementSerializer, EmailNotificationSerializer)
from .models import CourseDiscussion, DiscussionComment, NotificationPreference, StudentAchievement, EmailNotification
from courses.models import Enrollment
from quizzes.models import QuizAttempt

User = get_user_model()

class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Create notification preferences for new user
            NotificationPreference.objects.create(user=user)
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'User registered successfully',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        user = authenticate(request, username=email, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Login successful',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            }, status=status.HTTP_200_OK)
        return Response({
            'error': 'Invalid email or password'
        }, status=status.HTTP_401_UNAUTHORIZED)


class ProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Logged out successfully'})
        except Exception:
            return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)


class CourseDiscussionViewSet(viewsets.ModelViewSet):
    """Discussion forum for courses"""
    permission_classes = [IsAuthenticated]
    serializer_class = CourseDiscussionSerializer
    
    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        return CourseDiscussion.objects.filter(course_id=course_id)
    
    def perform_create(self, serializer):
        course_id = self.kwargs.get('course_id')
        serializer.save(author=self.request.user, course_id=course_id)
    
    @action(detail=False, methods=['get'])
    def my_discussions(self, request):
        """Get current user's discussions"""
        discussions = CourseDiscussion.objects.filter(author=request.user)
        serializer = self.get_serializer(discussions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def pin(self, request, pk=None):
        """Pin a discussion (instructor only)"""
        discussion = self.get_object()
        if discussion.course.instructor != request.user:
            return Response({'error': 'Only instructor can pin discussions'}, status=status.HTTP_403_FORBIDDEN)
        discussion.is_pinned = not discussion.is_pinned
        discussion.save()
        return Response({'message': f"Discussion {'pinned' if discussion.is_pinned else 'unpinned'}"})


class DiscussionCommentViewSet(viewsets.ModelViewSet):
    """Comments on discussion threads"""
    permission_classes = [IsAuthenticated]
    serializer_class = DiscussionCommentSerializer
    
    def get_queryset(self):
        discussion_id = self.kwargs.get('discussion_id')
        return DiscussionComment.objects.filter(discussion_id=discussion_id)
    
    def perform_create(self, serializer):
        discussion_id = self.kwargs.get('discussion_id')
        serializer.save(author=self.request.user, discussion_id=discussion_id)


class InstructorDashboardView(APIView):
    """Instructor dashboard with analytics"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Check if user is instructor
        if request.user.role != 'instructor':
            return Response({'error': 'Only instructors can access this'}, status=status.HTTP_403_FORBIDDEN)
        
        # Get instructor's courses
        from courses.models import Course
        courses = Course.objects.filter(instructor=request.user)
        
        stats = {
            'total_courses': courses.count(),
            'total_students': Enrollment.objects.filter(course__instructor=request.user).values('student').distinct().count(),
            'total_quizzes': sum(course.quizzes.count() for course in courses),
            'average_quiz_score': QuizAttempt.objects.filter(
                quiz__course__instructor=request.user
            ).aggregate(avg=Avg('score'))['avg'] or 0,
            'courses': []
        }
        
        # Detailed course stats
        for course in courses:
            enrollments = Enrollment.objects.filter(course=course)
            quiz_attempts = QuizAttempt.objects.filter(quiz__course=course)
            
            stats['courses'].append({
                'id': course.id,
                'title': course.title,
                'students_enrolled': enrollments.count(),
                'total_quizzes': course.quizzes.count(),
                'total_attempts': quiz_attempts.count(),
                'avg_score': quiz_attempts.aggregate(avg=Avg('score'))['avg'] or 0,
                'completion_rate': (enrollments.filter(completed=True).count() / enrollments.count() * 100) if enrollments.exists() else 0
            })
        
        return Response(stats)


class StudentAchievementView(generics.ListAPIView):
    """Get student achievements"""
    permission_classes = [IsAuthenticated]
    serializer_class = StudentAchievementSerializer
    
    def get_queryset(self):
        return StudentAchievement.objects.filter(student=self.request.user)


class NotificationPreferenceView(generics.RetrieveUpdateAPIView):
    """Manage notification preferences"""
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationPreferenceSerializer
    
    def get_object(self):
        preference, created = NotificationPreference.objects.get_or_create(user=self.request.user)
        return preference


class StudentLeaderboardView(APIView):
    """Quiz leaderboard"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        course_id = request.query_params.get('course_id')
        
        if course_id:
            # Leaderboard for specific course
            leaderboard = (QuizAttempt.objects
                          .filter(quiz__course_id=course_id)
                          .values('student__username', 'student__id')
                          .annotate(avg_score=Avg('score'), attempts=Count('id'))
                          .order_by('-avg_score')[:20])
        else:
            # Global leaderboard
            leaderboard = (QuizAttempt.objects
                          .values('student__username', 'student__id')
                          .annotate(avg_score=Avg('score'), attempts=Count('id'))
                          .order_by('-avg_score')[:20])
        
        return Response([
            {
                'rank': idx + 1,
                'student_id': item['student__id'],
                'username': item['student__username'],
                'average_score': round(item['avg_score'], 2),
                'quiz_attempts': item['attempts']
            }
            for idx, item in enumerate(leaderboard)
        ])