import os
from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _

def document_upload_path(instance, filename):
    return f'document/user_{instance.user.id}/(filename)'

class Document(models.Model):
    """users upload files Pdf and etc"""

    class FileType(models.TextChoices):
        PDF = 'pdf', _('PDF')
        DOCX = 'docx', _('Word Document')
        TXT = 'txt', _('Text File')

    class Status(models.TextChoices):
        PENDING = 'pending', _('Pending')        # yuklandi, hali parse qilinmadi
        PROCESSING = 'processing', _('Processing')  # parse qilinyapti
        COMPLETED = 'completed', _('Completed')   # parse qilingan, tayyor
        FAILED = 'failed', _('Failed')

        #egasi
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='documents',
        verbose_name=_('user'),
    )

    #about file
    title = models.CharField(_('title'), max_length=255)
    file = models.FileField(_('file'), upload_to=document_upload_path)
    file_type = models.CharField(
        _('file type'),
        max_length=10,
        choices=FileType.choices,
    )
    file_size = models.PositiveIntegerField(
        _('file size'),
        help_text=_('File bayt'),
    )
    extracted_text = models.TextField(
        _('extract text'),
        blank=True,
        help_text=_('Extracted text from file')
    )

    page_count = models.PositiveIntegerField(
        _('page count'),
        default=0,
    )
    word_count = models.PositiveIntegerField(
        _('word count'),
        default=0
    )

    #condition
    status = models.CharField(
        _('status'),
        max_length=15,
        choices=Status.choices,
        default=Status.PENDING,
    )
    error_message = models.TextField(
        _('error message'),
        blank=True,
    )
    #Time
    created_at = models.DateTimeField(_('created at'), auto_now_add=True)
    updated_at = models.DateTimeField(_('updated at'), auto_now=True)

    class Meta:
        verbose_name =_('documents')
        verbose_name_plural = _('documents')
        db_table = 'documents'
        ordering =['-created_at']
        indexes =[
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f'{self.title} ({self.user.email})'
    
    @property
    def filename(self):
        return os.path.basename(self.file.name)

    @property
    def file_size_mb(self):
        return round(self.file_size / (1024*1024), 2)
    
    def delete(self, *args, **kwargs):
        if self.file and os.path.isfile(self.file.path):
            os.remove(self.file.path)
        super().delete(*args, **kwargs)



# Create your models here.
