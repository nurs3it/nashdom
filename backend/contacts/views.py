from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count
from django.utils import timezone

from users.permissions import IsSuperAdminUser
from .models import ContactRequest, Newsletter
from .serializers import (
    ContactRequestSerializer,
    ContactRequestUpdateSerializer, 
    NewsletterSerializer,
    ContactStatsSerializer
)


class ContactRequestCreateView(generics.CreateAPIView):
    """Создание заявки на связь"""
    serializer_class = ContactRequestSerializer
    permission_classes = [permissions.AllowAny]


class ContactRequestListView(generics.ListAPIView):
    """Список заявок (только для админов)"""
    serializer_class = ContactRequestSerializer
    permission_classes = [IsSuperAdminUser]
    
    def get_queryset(self):
        return ContactRequest.objects.select_related(
            'property', 'user', 'assigned_to'
        ).order_by('-created_at')


class ContactRequestUpdateView(generics.UpdateAPIView):
    """Обновление статуса заявки (только для админов)"""
    queryset = ContactRequest.objects.all()
    serializer_class = ContactRequestUpdateSerializer
    permission_classes = [IsSuperAdminUser]
    
    def perform_update(self, serializer):
        # Автоматически устанавливаем время обработки при изменении статуса
        if 'status' in serializer.validated_data:
            if serializer.validated_data['status'] in ['completed', 'cancelled']:
                serializer.save(processed_at=timezone.now())
            else:
                serializer.save()
        else:
            serializer.save()


class UserContactRequestsView(generics.ListAPIView):
    """Заявки текущего пользователя"""
    serializer_class = ContactRequestSerializer
    permission_classes = [IsSuperAdminUser]
    
    def get_queryset(self):
        return ContactRequest.objects.filter(
            user=self.request.user
        ).select_related('property').order_by('-created_at')


class NewsletterSubscribeView(generics.CreateAPIView):
    """Подписка на рассылку"""
    serializer_class = NewsletterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            newsletter, created = Newsletter.objects.get_or_create(
                email=email,
                defaults={'is_active': True}
            )
            
            if created:
                return Response(
                    {'message': 'Вы успешно подписались на рассылку'},
                    status=status.HTTP_201_CREATED
                )
            elif not newsletter.is_active:
                newsletter.is_active = True
                newsletter.save()
                return Response(
                    {'message': 'Подписка возобновлена'},
                    status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {'message': 'Вы уже подписаны на рассылку'},
                    status=status.HTTP_200_OK
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NewsletterUnsubscribeView(generics.UpdateAPIView):
    """Отписка от рассылки"""
    queryset = Newsletter.objects.all()
    serializer_class = NewsletterSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'email'
    
    def update(self, request, *args, **kwargs):
        try:
            newsletter = self.get_object()
            newsletter.is_active = False
            newsletter.save()
            return Response(
                {'message': 'Вы успешно отписались от рассылки'},
                status=status.HTTP_200_OK
            )
        except Newsletter.DoesNotExist:
            return Response(
                {'error': 'Email не найден'},
                status=status.HTTP_404_NOT_FOUND
            )


@api_view(['GET'])
@permission_classes([IsSuperAdminUser])
def contact_stats(request):
    """Статистика заявок (только для админов)"""
    total_requests = ContactRequest.objects.count()
    new_requests = ContactRequest.objects.filter(status='new').count()
    in_progress_requests = ContactRequest.objects.filter(status='in_progress').count()
    completed_requests = ContactRequest.objects.filter(status='completed').count()
    
    # Статистика по типам заявок
    requests_by_type = dict(
        ContactRequest.objects.values('request_type')
        .annotate(count=Count('id'))
        .values_list('request_type', 'count')
    )
    
    # Последние заявки
    recent_requests = ContactRequest.objects.order_by('-created_at')[:5]
    recent_requests_data = ContactRequestSerializer(recent_requests, many=True).data
    
    stats = {
        'total_requests': total_requests,
        'new_requests': new_requests,
        'in_progress_requests': in_progress_requests,
        'completed_requests': completed_requests,
        'requests_by_type': requests_by_type,
        'recent_requests': recent_requests_data
    }
    
    return Response(stats)