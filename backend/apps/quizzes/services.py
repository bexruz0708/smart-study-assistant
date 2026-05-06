"""
Quiz Service - AI bilan test yaratish.
"""
import json
import logging
import re

from apps.ai_chat.services.gemini_client import GeminiClient

logger = logging.getLogger(__name__)


QUIZ_GENERATION_PROMPT = """Siz o'qituvchi AI yordamchisiz. Quyidagi matn asosida {count} ta test savoli yarating.

MATN:
{text}

QOIDALAR:
1. Har bir savol 4 ta variantdan iborat (A, B, C, D)
2. Faqat BITTA to'g'ri javob bo'lsin
3. Savol O'ZBEK tilida bo'lsin
4. Savollar matn mazmuniga mos bo'lsin
5. Variantlar o'xshash bo'lsin (oson topib bo'lmasin)
6. Har bir savolga qisqa tushuntirish qo'shing

JAVOB FORMATI (faqat JSON, boshqa hech narsa yozmang):
[
  {{
    "question": "Savol matni?",
    "options": {{
      "A": "Variant A",
      "B": "Variant B",
      "C": "Variant C",
      "D": "Variant D"
    }},
    "correct_answer": "A",
    "explanation": "Nega bu javob to'g'ri ekanligi haqida 1-2 jumla"
  }}
]

JSON'ni qaytaring (markdown ```json yo'q, faqat sof JSON)."""


class QuizGeneratorService:
    """AI bilan test yaratish."""
    
    @staticmethod
    def generate_questions(text, count=10):
        """
        Matn asosida test savollari yaratish.
        
        Args:
            text: matn (PDF dan olingan)
            count: nechta savol
        
        Returns:
            list[dict]: savollar ro'yxati
        """
        # Matn juda uzun bo'lsa, qisqartiramiz (Gemini limit)
        max_chars = 15000
        if len(text) > max_chars:
            text = text[:max_chars]
        
        # Prompt
        prompt = QUIZ_GENERATION_PROMPT.format(
            text=text,
            count=count,
        )
        
        # Gemini chaqirish
        gemini = GeminiClient()
        try:
            response = gemini.generate_response(prompt)
        except Exception as e:
            logger.error(f'Gemini error: {e}')
            raise ValueError(f'AI can not make questions: {str(e)}')
        
        # JSON parse qilish
        try:
            # Markdown ```json bo'lishi mumkin - tozalaymiz
            cleaned = response.strip()
            if cleaned.startswith('```'):
                # ```json yoki ``` ni olib tashlash
                cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
                cleaned = re.sub(r'\s*```$', '', cleaned)
            
            questions = json.loads(cleaned)
            
            if not isinstance(questions, list):
                raise ValueError('Javob list emas')
            
            # Validatsiya
            for q in questions:
                if not all(k in q for k in ['question', 'options', 'correct_answer']):
                    raise ValueError('Question structure incorrect')
            
            return questions
        
        except json.JSONDecodeError as e:
            logger.error(f'JSON parse error: {e}\nResponse: {response[:500]}')
            raise ValueError('AI answer wrong structure')
        except Exception as e:
            logger.error(f'Validation error: {e}')
            raise ValueError(f'Question check incorrect: {str(e)}')


class QuizService:
    """Quiz va Question'larni boshqarish."""
    
    @staticmethod
    def create_quiz_from_document(user, document, count=10, title=None):
        """
        Document'dan AI bilan quiz yaratish.
        """
        from .models import Quiz, Question
        
        if not document.extracted_text:
            raise ValueError('Document text is emty')
        
        if document.user != user:
            raise ValueError('This document is not yours')
        
        # AI savollarini yaratish
        questions_data = QuizGeneratorService.generate_questions(
            document.extracted_text,
            count=count,
        )
        
        # Quiz yaratish
        quiz = Quiz.objects.create(
            user=user,
            document=document,
            title=title or f'Test: {document.title}',
            question_count=len(questions_data),
        )
        
        # Savollarni saqlash
        for i, q_data in enumerate(questions_data):
            Question.objects.create(
                quiz=quiz,
                question_text=q_data['question'],
                options=q_data['options'],
                correct_answer=q_data['correct_answer'],
                explanation=q_data.get('explanation', ''),
                order=i,
            )
        
        return quiz
    
    @staticmethod
    def submit_attempt(user, quiz, user_answers):
        """
        Test javoblarini tekshirish.
        
        Args:
            user_answers: dict, masalan {'1': 'A', '2': 'C', ...}
        """
        from django.utils import timezone
        from .models import QuizAttempt
        
        questions = quiz.questions.all()
        total = questions.count()
        correct = 0
        
        for question in questions:
            user_answer = user_answers.get(str(question.id))
            if user_answer == question.correct_answer:
                correct += 1
        
        score = round((correct / total) * 100) if total > 0 else 0
        
        attempt = QuizAttempt.objects.create(
            user=user,
            quiz=quiz,
            answers=user_answers,
            score=score,
            total_questions=total,
            correct_count=correct,
            completed_at=timezone.now(),
        )
        
        return attempt
    
    """
PDF Generator Service
"""
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)


class QuizPDFExporter:
    """Test natijalarini PDF qilish."""
    
    @staticmethod
    def export_attempt(attempt):
        """
        QuizAttempt ni PDF qilib qaytarish.
        
        Returns:
            BytesIO: PDF fayl xotirada
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm,
        )
        
        styles = getSampleStyleSheet()
        
        # Custom stillar
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=20,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=20,
            alignment=1,  # center
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#1e293b'),
            spaceAfter=10,
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=6,
        )
        
        story = []
        
        # Sarlavha
        story.append(Paragraph('Smart Study Assistant', title_style))
        story.append(Paragraph(f'<b>Test natijalari</b>', heading_style))
        story.append(Spacer(1, 0.3*cm))
        
        # Asosiy ma'lumot
        info_data = [
            ['Test:', attempt.quiz.title],
            ['Foydalanuvchi:', f'{attempt.user.first_name} {attempt.user.last_name}'.strip() or attempt.user.email],
            ['Sana:', attempt.completed_at.strftime('%d.%m.%Y %H:%M') if attempt.completed_at else '-'],
            ['Natija:', f'{attempt.score}%'],
            ['To\'g\'ri javoblar:', f'{attempt.correct_count} / {attempt.total_questions}'],
        ]
        
        info_table = Table(info_data, colWidths=[5*cm, 11*cm])
        info_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#475569')),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ]))
        story.append(info_table)
        story.append(Spacer(1, 0.5*cm))
        
        # Natija bahosi
        score = attempt.score
        if score >= 80:
            grade_text = "A'lo natija!"
            grade_color = colors.HexColor('#16a34a')
        elif score >= 60:
            grade_text = "Yaxshi"
            grade_color = colors.HexColor('#ca8a04')
        else:
            grade_text = "Yana harakat qiling"
            grade_color = colors.HexColor('#dc2626')
        
        grade_style = ParagraphStyle(
            'Grade',
            fontSize=14,
            textColor=grade_color,
            alignment=1,
            spaceAfter=20,
        )
        story.append(Paragraph(f'<b>{grade_text}</b>', grade_style))
        story.append(Spacer(1, 0.5*cm))
        
        # Savollar va javoblar
        story.append(Paragraph('Savollar va javoblar', heading_style))
        story.append(Spacer(1, 0.3*cm))
        
        questions = attempt.quiz.questions.all().order_by('order')
        user_answers = attempt.answers
        
        for i, q in enumerate(questions, 1):
            user_answer = user_answers.get(str(q.id), '-')
            is_correct = user_answer == q.correct_answer
            
            # Savol
            q_style = ParagraphStyle(
                'Question',
                parent=normal_style,
                fontSize=12,
                fontName='Helvetica-Bold',
                spaceAfter=8,
            )
            story.append(Paragraph(f'{i}. {q.question_text}', q_style))
            
            # Variantlar
            for key, value in q.options.items():
                is_user = key == user_answer
                is_right = key == q.correct_answer
                
                if is_right:
                    prefix = '✓'
                    color = '#16a34a'
                elif is_user and not is_right:
                    prefix = '✗'
                    color = '#dc2626'
                else:
                    prefix = '○'
                    color = '#64748b'
                
                option_text = f'<font color="{color}">{prefix} <b>{key}.</b> {value}</font>'
                story.append(Paragraph(option_text, normal_style))
            
            # Tushuntirish
            if q.explanation:
                exp_style = ParagraphStyle(
                    'Explanation',
                    parent=normal_style,
                    fontSize=10,
                    textColor=colors.HexColor('#475569'),
                    leftIndent=10,
                    spaceBefore=4,
                    spaceAfter=12,
                )
                story.append(Paragraph(f'<i>Izoh: {q.explanation}</i>', exp_style))
            else:
                story.append(Spacer(1, 0.3*cm))
        
        # Footer
        story.append(Spacer(1, 1*cm))
        footer_style = ParagraphStyle(
            'Footer',
            fontSize=9,
            textColor=colors.HexColor('#94a3b8'),
            alignment=1,
        )
        story.append(Paragraph('Smart Study Assistant - AI yordamida o\'rganish', footer_style))
        
        # PDF yaratish
        doc.build(story)
        buffer.seek(0)
        return buffer