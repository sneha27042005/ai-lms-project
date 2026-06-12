from django.contrib import admin
from .models import Quiz, Question, QuizAttempt, QuestionAttemptDetail, BookmarkedQuestion


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'difficulty', 'time_limit_minutes', 'passing_score', 'created_at']
    list_filter = ['difficulty', 'created_at']
    search_fields = ['title', 'description']
    fieldsets = (
        ('Basic Info', {
            'fields': ('title', 'description', 'course', 'lesson')
        }),
        ('Settings', {
            'fields': ('passing_score', 'time_limit_minutes', 'difficulty', 'show_answers_after', 'randomize_questions')
        }),
    )


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['text', 'quiz', 'correct_option', 'order']
    list_filter = ['quiz', 'correct_option']
    search_fields = ['text']
    fieldsets = (
        ('Question', {
            'fields': ('quiz', 'text', 'order')
        }),
        ('Options', {
            'fields': ('option_a', 'option_b', 'option_c', 'option_d')
        }),
        ('Answer', {
            'fields': ('correct_option', 'explanation')
        }),
    )


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['student', 'quiz', 'score', 'percentage', 'is_passed', 'attempted_at']
    list_filter = ['is_passed', 'attempted_at', 'quiz']
    search_fields = ['student__email', 'quiz__title']
    readonly_fields = ['student', 'quiz', 'score', 'percentage', 'attempted_at']


@admin.register(QuestionAttemptDetail)
class QuestionAttemptDetailAdmin(admin.ModelAdmin):
    list_display = ['attempt', 'question', 'selected_answer', 'is_correct']
    list_filter = ['is_correct', 'attempt__attempted_at']
    search_fields = ['question__text']
    readonly_fields = ['attempt', 'question']


@admin.register(BookmarkedQuestion)
class BookmarkedQuestionAdmin(admin.ModelAdmin):
    list_display = ['student', 'question', 'bookmarked_at']
    list_filter = ['bookmarked_at']
    search_fields = ['student__email', 'question__text']
    readonly_fields = ['student', 'question', 'bookmarked_at']