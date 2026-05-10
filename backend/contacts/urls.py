from django.urls import path
from .views import (
    ContactRequestCreateView,
    ContactRequestListView,
    ContactRequestUpdateView,
    UserContactRequestsView,
    NewsletterSubscribeView,
    NewsletterUnsubscribeView,
    contact_stats
)

app_name = 'contacts'

urlpatterns = [
    # Заявки на связь
    path('requests/', ContactRequestCreateView.as_view(), name='contact_create'),
    path('requests/list/', ContactRequestListView.as_view(), name='contact_list'),
    path('requests/<int:pk>/update/', ContactRequestUpdateView.as_view(), name='contact_update'),
    path('requests/my/', UserContactRequestsView.as_view(), name='user_contacts'),
    
    # Рассылка
    path('newsletter/subscribe/', NewsletterSubscribeView.as_view(), name='newsletter_subscribe'),
    path('newsletter/unsubscribe/<str:email>/', NewsletterUnsubscribeView.as_view(), name='newsletter_unsubscribe'),
    
    # Статистика (для админов)
    path('stats/', contact_stats, name='stats'),
]
