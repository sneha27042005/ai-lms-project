 
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import CourseDiscussion, DiscussionComment, EmailNotification, NotificationPreference, StudentAchievement

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'confirm_password', 'role']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match")
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'student')
        )
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'bio', 'avatar', 'created_at']
        read_only_fields = ['id', 'created_at']


class DiscussionCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    author_avatar = serializers.CharField(source='author.avatar', read_only=True)
    
    class Meta:
        model = DiscussionComment
        fields = ['id', 'discussion', 'author', 'author_name', 'author_avatar', 'content', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CourseDiscussionSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    author_avatar = serializers.CharField(source='author.avatar', read_only=True)
    comment_count = serializers.SerializerMethodField()
    comments = DiscussionCommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = CourseDiscussion
        fields = ['id', 'course', 'author', 'author_name', 'author_avatar', 'title', 'content', 
                  'comment_count', 'comments', 'is_pinned', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_comment_count(self, obj):
        return obj.comments.count()


class EmailNotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailNotification
        fields = ['id', 'user', 'notification_type', 'recipient_email', 'subject', 'body', 'is_sent', 'sent_at', 'created_at']
        read_only_fields = ['id', 'created_at']


class NotificationPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NotificationPreference
        fields = ['id', 'user', 'email_on_enrollment', 'email_on_quiz_result', 'email_on_discussion_reply',
                  'email_on_announcement', 'email_on_grade_update', 'email_on_assignment_due', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class StudentAchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentAchievement
        fields = ['id', 'student', 'achievement_type', 'title', 'description', 'icon', 'earned_at']
        read_only_fields = ['id', 'earned_at']