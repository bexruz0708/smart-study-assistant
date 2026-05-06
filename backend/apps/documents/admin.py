from django.contrib import admin

from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = (
        'title',
        'user',
        'file_type',
        'file_size_mb',
        'page_count',
        'word_count',
        'status',
        'created_at',
    )
    list_filter = ('file_type', 'status', 'created_at')
    search_fields = ('title', 'user__email')
    readonly_fields = (
        'file_size',
        'extracted_text',
        'page_count',
        'word_count',
        'status',
        'error_message',
        'created_at',
        'updated_at',
    )
    ordering = ('-created_at',)
    
    fieldsets = (
        (None, {
            'fields': ('user', 'title', 'file', 'file_type'),
        }),
        ('Stats', {
            'fields': ('file_size', 'page_count', 'word_count'),
        }),
        ('Content', {
            'fields': ('extracted_text',),
            'classes': ('collapse',),  # yashirilgan
        }),
        ('Status', {
            'fields': ('status', 'error_message'),
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
        }),
    )

# Register your models here.
