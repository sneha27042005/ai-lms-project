 
from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

router = DefaultRouter()

# Nested routes for discussions and comments
urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Discussions and Comments (nested under courses)
    path('courses/<int:course_id>/discussions/', views.CourseDiscussionViewSet.as_view({'get': 'list', 'post': 'create'}), name='course-discussions'),
    path('courses/<int:course_id>/discussions/<int:pk>/', views.CourseDiscussionViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='course-discussion-detail'),
    path('courses/<int:course_id>/discussions/<int:pk>/pin/', views.CourseDiscussionViewSet.as_view({'post': 'pin'}), name='discussion-pin'),
    path('courses/<int:course_id>/discussions/my-discussions/', views.CourseDiscussionViewSet.as_view({'get': 'my_discussions'}), name='my-discussions'),
    
    path('discussions/<int:discussion_id>/comments/', views.DiscussionCommentViewSet.as_view({'get': 'list', 'post': 'create'}), name='discussion-comments'),
    path('discussions/<int:discussion_id>/comments/<int:pk>/', views.DiscussionCommentViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='discussion-comment-detail'),
    
    # Instructor Dashboard & Analytics
    path('instructor/dashboard/', views.InstructorDashboardView.as_view(), name='instructor-dashboard'),
    
    # Achievements
    path('achievements/', views.StudentAchievementView.as_view(), name='achievements'),
    
    # Notification Preferences
    path('notification-preference/', views.NotificationPreferenceView.as_view(), name='notification-preference'),
    
    # Leaderboard
    path('leaderboard/', views.StudentLeaderboardView.as_view(), name='leaderboard'),
]