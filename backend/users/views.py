from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import ValidationError
from django.contrib.auth import get_user_model

from nashdom_backend.mixins import StandardResponseMixin, ErrorResponseMixin
from .serializers import (
    UserRegistrationSerializer, 
    UserProfileSerializer,
    UserUpdateSerializer, 
    ChangePasswordSerializer
)

User = get_user_model()


class UserRegistrationView(StandardResponseMixin, generics.CreateAPIView):
    """Регистрация нового пользователя"""
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        return self.created_response(
            data=response.data,
            message="Аккаунт успешно создан! Добро пожаловать!"
        )


class CustomTokenObtainPairView(TokenObtainPairView):
    """Кастомный вход с дополнительными данными пользователя"""
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            # Добавляем информацию о пользователе в ответ
            try:
                user = User.objects.get(email=request.data.get('email'))
                user_data = UserProfileSerializer(user).data
                response.data['user'] = user_data
            except User.DoesNotExist:
                pass
        return response


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Просмотр и обновление профиля пользователя"""
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method == 'PUT' or self.request.method == 'PATCH':
            return UserUpdateSerializer
        return UserProfileSerializer


class ChangePasswordView(StandardResponseMixin, APIView):
    """Смена пароля пользователя"""
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            
            # Проверяем старый пароль
            if not user.check_password(serializer.validated_data['old_password']):
                raise ValidationError({'old_password': 'Неверный старый пароль'})
            
            # Устанавливаем новый пароль
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return self.success_response(message='Пароль успешно изменен')
        
        # Поднимаем ValidationError для стандартной обработки
        raise ValidationError(serializer.errors)


from .permissions import IsSuperAdminUser

@api_view(['GET'])
@permission_classes([IsSuperAdminUser])
def user_stats(request):
    """Статистика пользователей (только для админов)"""
    total_users = User.objects.count()
    verified_users = User.objects.filter(is_verified=True).count()
    clients = User.objects.filter(role='client').count()
    realtors = User.objects.filter(role='realtor').count()
    admins = User.objects.filter(role='admin').count()
    
    recent_users = User.objects.order_by('-created_at')[:5]
    recent_users_data = UserProfileSerializer(recent_users, many=True).data
    
    stats = {
        'total_users': total_users,
        'verified_users': verified_users,
        'clients': clients,
        'realtors': realtors,
        'admins': admins,
        'recent_users': recent_users_data
    }
    
    return Response(stats)