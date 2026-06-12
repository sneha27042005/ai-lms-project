from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from .models import Quiz, Question, QuizAttempt, QuestionAttemptDetail, BookmarkedQuestion
from .serializers import (
    QuizSerializer, QuestionSerializer, QuestionDetailSerializer,
    QuizAttemptSerializer, SubmitQuizSerializer, BookmarkedQuestionSerializer
)


class QuizListView(generics.ListCreateAPIView):
    serializer_class = QuizSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        if course_id:
            return Quiz.objects.filter(course_id=course_id)
        return Quiz.objects.all()


class QuizDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]


class QuestionListView(generics.ListCreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        quiz_id = self.kwargs['quiz_id']
        return Question.objects.filter(quiz_id=quiz_id)

    def perform_create(self, serializer):
        quiz_id = self.kwargs['quiz_id']
        quiz = Quiz.objects.get(id=quiz_id)
        serializer.save(quiz=quiz)


class SubmitQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, quiz_id):
        try:
            quiz = Quiz.objects.get(id=quiz_id)
        except Quiz.DoesNotExist:
            return Response({
                'error': 'Quiz not found'
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = SubmitQuizSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        answers = serializer.validated_data['answers']
        questions = quiz.questions.all()
        total_questions = questions.count()
        score = 0

        results = []
        
        # Create quiz attempt
        attempt = QuizAttempt.objects.create(
            student=request.user,
            quiz=quiz,
            score=0,
            total_questions=total_questions,
            percentage=0,
            is_passed=False
        )

        for question in questions:
            selected = answers.get(str(question.id), '').upper()
            is_correct = selected == question.correct_option
            if is_correct:
                score += 1
            
            # Record individual question attempt
            QuestionAttemptDetail.objects.create(
                attempt=attempt,
                question=question,
                selected_answer=selected if selected else '',
                is_correct=is_correct
            )
            
            result = {
                'question_id': question.id,
                'question': question.text,
                'selected': selected,
                'correct': question.correct_option,
                'is_correct': is_correct,
            }
            
            # Include explanation if quiz shows answers
            if quiz.show_answers_after:
                result['explanation'] = question.explanation
            
            results.append(result)

        percentage = (score / total_questions * 100) if total_questions > 0 else 0
        is_passed = percentage >= quiz.passing_score

        # Update attempt with final scores
        attempt.score = score
        attempt.percentage = percentage
        attempt.is_passed = is_passed
        attempt.save()

        return Response({
            'message': 'Quiz submitted successfully',
            'score': score,
            'total_questions': total_questions,
            'percentage': round(percentage, 2),
            'is_passed': is_passed,
            'passing_score': quiz.passing_score,
            'show_answers': quiz.show_answers_after,
            'results': results
        }, status=status.HTTP_200_OK)


class MyAttemptsView(generics.ListAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return QuizAttempt.objects.filter(student=self.request.user)


class BookmarkQuestionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, question_id):
        question = get_object_or_404(Question, id=question_id)
        bookmark, created = BookmarkedQuestion.objects.get_or_create(
            student=request.user,
            question=question
        )
        return Response({
            'message': 'Question bookmarked' if created else 'Already bookmarked',
            'bookmarked': True
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request, question_id):
        question = get_object_or_404(Question, id=question_id)
        BookmarkedQuestion.objects.filter(
            student=request.user,
            question=question
        ).delete()
        return Response({
            'message': 'Bookmark removed',
            'bookmarked': False
        }, status=status.HTTP_200_OK)


class MyBookmarkedQuestionsView(generics.ListAPIView):
    serializer_class = BookmarkedQuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BookmarkedQuestion.objects.filter(student=self.request.user)


class AttemptDetailView(generics.RetrieveAPIView):
    serializer_class = QuizAttemptSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        attempt_id = self.kwargs['attempt_id']
        return get_object_or_404(QuizAttempt, id=attempt_id, student=self.request.user)