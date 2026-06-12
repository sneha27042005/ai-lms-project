from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, CourseDiscussion, DiscussionComment, EmailNotification, NotificationPreference, StudentAchievement

class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'username', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active']
    search_fields = ['email', 'username']
    ordering = ['-created_at']
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('role', 'bio', 'avatar')}),
    )

admin.site.register(User, CustomUserAdmin)


@admin.register(CourseDiscussion)
class CourseDiscussionAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'author', 'is_pinned', 'created_at']
    list_filter = ['course', 'is_pinned', 'created_at']
    search_fields = ['title', 'content', 'author__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(DiscussionComment)
class DiscussionCommentAdmin(admin.ModelAdmin):
    list_display = ['discussion', 'author', 'created_at']
    list_filter = ['discussion', 'created_at']
    search_fields = ['content', 'author__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(EmailNotification)
class EmailNotificationAdmin(admin.ModelAdmin):
    list_display = ['notification_type', 'recipient_email', 'is_sent', 'sent_at', 'created_at']
    list_filter = ['notification_type', 'is_sent', 'created_at']
    search_fields = ['recipient_email', 'subject']
    readonly_fields = ['created_at']


@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'email_on_enrollment', 'email_on_quiz_result', 'email_on_discussion_reply']
    list_filter = ['email_on_enrollment', 'email_on_quiz_result', 'email_on_discussion_reply']
    search_fields = ['user__email']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(StudentAchievement)
class StudentAchievementAdmin(admin.ModelAdmin):
    list_display = ['title', 'student', 'achievement_type', 'earned_at']
    list_filter = ['achievement_type', 'earned_at']
    search_fields = ['student__email', 'title']
    readonly_fields = ['earned_at']