from django.urls import path

from.views import (
    DocumentDetailView,
    DocumentListCreateView,
    DocumentReprocessView,
)

app_name = 'documents'

urlpatterns =[
    #list +create
    path('', DocumentListCreateView.as_view(), name='list_create'),
    path('<int:pk>/', DocumentDetailView.as_view(), name='detail'),
    path('<int:pk>/reprocess/', DocumentReprocessView.as_view(), name='reprocess'),
    

]