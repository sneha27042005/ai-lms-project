from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone

class User(AbstractUser):
    ROLE_CHOICES = (
        ('student', 'Student'),
        ('instructor', 'Instructor'),
        ('admin', 'Admin'),
    )
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    bio = models.TextField(blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


class CourseDiscussion(models.Model):
    """Course discussion threads"""
    course = models.ForeignKey('courses.Course', on_delete=models.CASCADE, related_name='discussions')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_pinned = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-is_pinned', '-created_at']
    
    def __str__(self):
        return self.title


class DiscussionComment(models.Model):
    """Comments on discussion threads"""
    discussion = models.ForeignKey(CourseDiscussion, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.author} on {self.discussion.title}"


class EmailNotification(models.Model):
    """Email notification preferences and history"""
    NOTIFICATION_TYPES = (
        ('enrollment', 'Course Enrollment'),
        ('quiz_result', 'Quiz Results'),
        ('discussion_reply', 'Discussion Reply'),
        ('announcement', 'Course Announcement'),
        ('grade_update', 'Grade Update'),
        ('assignment_due', 'Assignment Due Soon'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='email_notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    recipient_email = models.EmailField()
    subject = models.CharField(max_length=200)
    body = models.TextField()
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.notification_type} - {self.recipient_email}"


class NotificationPreference(models.Model):
    """User email notification preferences"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preference')
    email_on_enrollment = models.BooleanField(default=True)
    email_on_quiz_result = models.BooleanField(default=True)
    email_on_discussion_reply = models.BooleanField(default=True)
    email_on_announcement = models.BooleanField(default=True)
    email_on_grade_update = models.BooleanField(default=True)
    email_on_assignment_due = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Notification preferences for {self.user.email}"


class StudentAchievement(models.Model):
    """Student badges and achievements"""
    ACHIEVEMENT_TYPES = (
        ('first_quiz', 'Took First Quiz'),
        ('perfect_score', 'Perfect Score'),
        ('course_complete', 'Course Completed'),
        ('streak_7', '7 Day Streak'),
        ('streak_30', '30 Day Streak'),
        ('fast_learner', 'Fast Learner'),
        ('helper', 'Course Helper'),
    )
    
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement_type = models.CharField(max_length=50, choices=ACHIEVEMENT_TYPES)
    title = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=20, default='🏆')  # emoji or unicode
    earned_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('student', 'achievement_type')
        ordering = ['-earned_at']
    
    def __str__(self):
        return f"{self.title} - {self.student.email}"