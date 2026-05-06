from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from .views import(
    ChangePasswordView,
    LoginView,
    LogoutView,
    ProfileView,
    RegisterView,
)

app_name = 'users'

urlpatterns =[
    #Authetication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name ='login'),
    path('logout/', LogoutView.as_view(), name='logout'),

    #Jwt token
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),

    #Profile
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
]