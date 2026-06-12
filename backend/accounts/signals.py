"""
Django signals for automatic notifications
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from courses.models import Enrollment
from quizzes.models import QuizAttempt
from accounts.models import StudentAchievement
from .email_utils import notify_enrollment, notify_quiz_result, notify_achievement_earned


@receiver(post_save, sender=Enrollment)
def send_enrollment_notification(sender, instance, created, **kwargs):
    """Send email when student enrolls in a course"""
    if created:
        notify_enrollment(instance.student, instance.course.title)


@receiver(post_save, sender=QuizAttempt)
def send_quiz_result_notification(sender, instance, created, **kwargs):
    """Send email when student completes a quiz"""
    if created:
        passed = instance.percentage >= instance.quiz.passing_score
        notify_quiz_result(
            instance.student,
            instance.quiz.title,
            instance.score,
            instance.percentage,
            passed
        )


@receiver(post_save, sender=StudentAchievement)
def send_achievement_notification(sender, instance, created, **kwargs):
    """Send email when student earns an achievement"""
    if created:
        notify_achievement_earned(instance.student, instance.title)
