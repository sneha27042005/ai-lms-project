from rest_framework import serializers
from .models import Quiz, Question, QuizAttempt, QuestionAttemptDetail, BookmarkedQuestion


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'option_a', 'option_b', 'option_c', 'option_d', 'order']


class QuestionDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'explanation', 'order']


class QuestionAnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['id', 'text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option', 'order']


class CourseBasicSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    total_questions = serializers.SerializerMethodField()
    course_title = serializers.CharField(source='course.title', read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'course', 'course_title', 'lesson', 'title', 'description', 'passing_score', 'time_limit_minutes', 
                  'difficulty', 'show_answers_after', 'randomize_questions', 'questions', 'total_questions', 'created_at']

    def get_total_questions(self, obj):
        return obj.questions.count()


class QuestionAttemptDetailSerializer(serializers.ModelSerializer):
    question = QuestionDetailSerializer(read_only=True)
    
    class Meta:
        model = QuestionAttemptDetail
        fields = ['id', 'question', 'selected_answer', 'is_correct']


class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz_title = serializers.SerializerMethodField()
    question_details = QuestionAttemptDetailSerializer(many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        fields = ['id', 'student', 'quiz', 'quiz_title', 'score', 'total_questions', 'percentage', 'is_passed', 'attempted_at', 'question_details']
        read_only_fields = ['student', 'score', 'total_questions', 'percentage', 'is_passed', 'attempted_at']

    def get_quiz_title(self, obj):
        return obj.quiz.title


class BookmarkedQuestionSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.text', read_only=True)
    
    class Meta:
        model = BookmarkedQuestion
        fields = ['id', 'question', 'question_text', 'bookmarked_at']


class SubmitQuizSerializer(serializers.Serializer):
    answers = serializers.DictField(
        child=serializers.CharField(),
        help_text="Dictionary of question_id: selected_option"
    )