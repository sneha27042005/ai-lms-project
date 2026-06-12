from django.urls import path
from . import views

urlpatterns = [
    path('', views.QuizListView.as_view(), name='quiz-list'),
    path('<int:pk>/', views.QuizDetailView.as_view(), name='quiz-detail'),
    path('<int:quiz_id>/questions/', views.QuestionListView.as_view(), name='question-list'),
    path('<int:quiz_id>/submit/', views.SubmitQuizView.as_view(), name='submit-quiz'),
    path('my-attempts/', views.MyAttemptsView.as_view(), name='my-attempts'),
    path('attempts/<int:attempt_id>/', views.AttemptDetailView.as_view(), name='attempt-detail'),
    path('questions/<int:question_id>/bookmark/', views.BookmarkQuestionView.as_view(), name='bookmark-question'),
    path('my-bookmarks/', views.MyBookmarkedQuestionsView.as_view(), name='my-bookmarks'),
]