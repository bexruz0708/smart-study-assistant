from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = User 
        fields =(
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'avatar',
            'is_verified',
            'date_joined',
        )
        read_only_fields = ('id', 'email', 'is_verified', 'date_joined')

    def get_full_name(self, obj):
        return obj.get_full_name()
    
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only =True,
        required=True,
        min_length=8,
        style={'input_type': 'password'},
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'},
    )

    class Meta:
        model = User
        fields = (
            'email',
            'first_name',
            'last_name',
            'password',
            'password_confirm',
        )

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                'This email already register'
            )
        return value.lower()
    
    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Passwords is not same'
            })
        return attrs 
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        #create user
        user = User.objects.create_user(**validated_data)
        return user
    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'},
    )

    def validate(self, attrs):
        email = attrs.get('email').lower()
        password = attrs.get('password')

        #check authicate
        user = authenticate(
            request=self.context.get('request'),
            username = email,
            password = password,
        )

        if not user:
            raise serializers.ValidationError(
                'Email or password is incorrect',
                code='authorization' 
            )
        
        if not user.is_active:
            raise serializers.ValidationError(
                'Account has ben blocked',
                code='authorization',
            )
        
        attrs['user'] = user
        return attrs
    
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(
        required=True,
        write_only=True,
        style={'imput_type': 'password'},
    )
    new_password = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
    )
    new_password_confirm = serializers.CharField(
        required=True,
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError(
                'Old password is incorrect'
            )
        return value 
    
    def validate_new_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.message))
        return value
    
    def validate(self, attrs):
        """Ikkita yangi parol bir xilligi va eskidan farqli."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'Passwords is not same.'
            })
        if attrs['old_password'] == attrs['new_password']:
            raise serializers.ValidationError({
                'new_password': 'New password will be differnt from old password.'
            })
        return attrs
    
    def save(self, **kwargs):
        """Change password and save."""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


def get_tokens_for_user(user):
    """
    Create JWT toke for users.
    
    Returns:
        dict: {'refresh': '...', 'access': '...'}
    """
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }