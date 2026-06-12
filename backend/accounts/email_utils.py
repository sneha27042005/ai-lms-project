"""
Email notification utilities for the AI LMS platform
"""
from django.core.mail import send_mail
from django.conf import settings
from .models import EmailNotification, NotificationPreference
from django.utils import timezone

def send_notification_email(user, notification_type, subject, body):
    """
    Send email notification to user if they have it enabled
    """
    try:
        # Check if user has email notifications enabled
        pref, _ = NotificationPreference.objects.get_or_create(user=user)
        
        # Check if this notification type is enabled
        pref_field = f'email_on_{notification_type}'
        if not getattr(pref, pref_field, True):
            return False
        
        # Create notification record
        notification = EmailNotification.objects.create(
            user=user,
            notification_type=notification_type,
            recipient_email=user.email,
            subject=subject,
            body=body,
        )
        
        # Send email
        try:
            send_mail(
                subject=subject,
                message=body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
                html_message=f'<html><body>{body}</body></html>'
            )
            notification.is_sent = True
            notification.sent_at = timezone.now()
            notification.save()
            return True
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False
            
    except Exception as e:
        print(f"Error creating notification: {e}")
        return False


def notify_quiz_result(user, quiz_title, score, percentage, passed):
    """Send quiz result notification"""
    status = "PASSED" if passed else "FAILED"
    subject = f"Quiz Result: {quiz_title} - {status}"
    body = f"""
    <h2>Your Quiz Result</h2>
    <p>Quiz: {quiz_title}</p>
    <p>Score: {score}%</p>
    <p>Result: {status}</p>
    <p>Keep learning!</p>
    """
    return send_notification_email(user, 'quiz_result', subject, body)


def notify_enrollment(user, course_title):
    """Send enrollment confirmation"""
    subject = f"Enrolled in {course_title}"
    body = f"""
    <h2>Welcome to {course_title}!</h2>
    <p>You have successfully enrolled in this course.</p>
    <p>Start learning today!</p>
    """
    return send_notification_email(user, 'enrollment', subject, body)


def notify_discussion_reply(user, course_title, discussion_title):
    """Notify user of discussion reply"""
    subject = f"New reply in {discussion_title}"
    body = f"""
    <h2>New Discussion Reply</h2>
    <p>Course: {course_title}</p>
    <p>Discussion: {discussion_title}</p>
    <p>Someone replied to your discussion!</p>
    """
    return send_notification_email(user, 'discussion_reply', subject, body)


def notify_achievement_earned(user, achievement_title):
    """Notify user of achievement earned"""
    subject = f"Achievement Unlocked: {achievement_title}"
    body = f"""
    <h2>Congratulations! 🎉</h2>
    <p>You have earned the achievement: <strong>{achievement_title}</strong></p>
    <p>Keep up the great work!</p>
    """
    return send_notification_email(user, 'announcement', subject, body)
