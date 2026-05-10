"""
Стандартизированная система обработки ошибок
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
from django.http import Http404
from django.core.exceptions import PermissionDenied, ValidationError
from django.db import IntegrityError
import logging

logger = logging.getLogger(__name__)


class ErrorCodes:
    """Коды ошибок для фронтенда"""
    VALIDATION_ERROR = 'VALIDATION_ERROR'
    AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR'
    PERMISSION_ERROR = 'PERMISSION_ERROR'
    NOT_FOUND_ERROR = 'NOT_FOUND_ERROR'
    INTEGRITY_ERROR = 'INTEGRITY_ERROR'
    SERVER_ERROR = 'SERVER_ERROR'
    THROTTLE_ERROR = 'THROTTLE_ERROR'


class ErrorMessages:
    """Стандартные сообщения об ошибках"""
    VALIDATION_ERROR = 'Проверьте правильность заполнения полей'
    AUTHENTICATION_REQUIRED = 'Необходимо войти в систему'
    AUTHENTICATION_FAILED = 'Неверные данные для входа'
    PERMISSION_DENIED = 'У вас нет прав для выполнения этого действия'
    NOT_FOUND = 'Запрашиваемый ресурс не найден'
    ALREADY_EXISTS = 'Объект с такими данными уже существует'
    SERVER_ERROR = 'Произошла внутренняя ошибка сервера'
    THROTTLE_ERROR = 'Слишком много запросов. Попробуйте позже'


def custom_exception_handler(exc, context):
    """
    Кастомный обработчик исключений для стандартизации ответов об ошибках
    """
    # Получаем стандартный ответ от DRF
    response = exception_handler(exc, context)
    
    if response is not None:
        # Получаем информацию о запросе
        request = context.get('request')
        view = context.get('view')
        
        # Логируем ошибку
        logger.error(
            f"API Error: {exc.__class__.__name__} in {view.__class__.__name__} "
            f"for user {getattr(request.user, 'email', 'Anonymous')} "
            f"at {request.path}: {str(exc)}"
        )
        
        # Создаем стандартизированный ответ
        custom_response_data = create_error_response(exc, response)
        response.data = custom_response_data
    
    return response


def create_error_response(exc, response):
    """
    Создает стандартизированный формат ответа об ошибке
    """
    error_data = {
        'success': False,
        'error': {
            'code': get_error_code(exc, response.status_code),
            'message': get_error_message(exc, response.status_code),
            'details': None,
            'field_errors': None
        }
    }
    
    # Обрабатываем ошибки валидации полей
    if response.status_code == status.HTTP_400_BAD_REQUEST:
        if hasattr(exc, 'detail') and isinstance(exc.detail, dict):
            error_data['error']['field_errors'] = format_field_errors(exc.detail)
            error_data['error']['message'] = ErrorMessages.VALIDATION_ERROR
        elif hasattr(exc, 'detail'):
            error_data['error']['details'] = str(exc.detail)
    
    # Обрабатываем ошибки аутентификации
    elif response.status_code == status.HTTP_401_UNAUTHORIZED:
        if 'credentials' in str(exc).lower() or 'invalid' in str(exc).lower():
            error_data['error']['message'] = ErrorMessages.AUTHENTICATION_FAILED
        else:
            error_data['error']['message'] = ErrorMessages.AUTHENTICATION_REQUIRED
    
    # Обрабатываем ошибки прав доступа
    elif response.status_code == status.HTTP_403_FORBIDDEN:
        error_data['error']['message'] = ErrorMessages.PERMISSION_DENIED
    
    # Обрабатываем ошибки "не найдено"
    elif response.status_code == status.HTTP_404_NOT_FOUND:
        error_data['error']['message'] = ErrorMessages.NOT_FOUND
    
    # Обрабатываем ошибки целостности данных
    elif response.status_code == status.HTTP_409_CONFLICT:
        error_data['error']['message'] = ErrorMessages.ALREADY_EXISTS
    
    # Обрабатываем ошибки ограничения запросов
    elif response.status_code == status.HTTP_429_TOO_MANY_REQUESTS:
        error_data['error']['message'] = ErrorMessages.THROTTLE_ERROR
        if hasattr(exc, 'wait'):
            error_data['error']['details'] = f'Повторите попытку через {exc.wait} секунд'
    
    # Обрабатываем серверные ошибки
    elif response.status_code >= 500:
        error_data['error']['message'] = ErrorMessages.SERVER_ERROR
    
    return error_data


def get_error_code(exc, status_code):
    """Определяет код ошибки по типу исключения"""
    if status_code == status.HTTP_400_BAD_REQUEST:
        return ErrorCodes.VALIDATION_ERROR
    elif status_code == status.HTTP_401_UNAUTHORIZED:
        return ErrorCodes.AUTHENTICATION_ERROR
    elif status_code == status.HTTP_403_FORBIDDEN:
        return ErrorCodes.PERMISSION_ERROR
    elif status_code == status.HTTP_404_NOT_FOUND:
        return ErrorCodes.NOT_FOUND_ERROR
    elif status_code == status.HTTP_409_CONFLICT:
        return ErrorCodes.INTEGRITY_ERROR
    elif status_code == status.HTTP_429_TOO_MANY_REQUESTS:
        return ErrorCodes.THROTTLE_ERROR
    else:
        return ErrorCodes.SERVER_ERROR


def get_error_message(exc, status_code):
    """Определяет сообщение об ошибке по умолчанию"""
    if status_code == status.HTTP_400_BAD_REQUEST:
        return ErrorMessages.VALIDATION_ERROR
    elif status_code == status.HTTP_401_UNAUTHORIZED:
        return ErrorMessages.AUTHENTICATION_REQUIRED
    elif status_code == status.HTTP_403_FORBIDDEN:
        return ErrorMessages.PERMISSION_DENIED
    elif status_code == status.HTTP_404_NOT_FOUND:
        return ErrorMessages.NOT_FOUND
    elif status_code == status.HTTP_409_CONFLICT:
        return ErrorMessages.ALREADY_EXISTS
    elif status_code == status.HTTP_429_TOO_MANY_REQUESTS:
        return ErrorMessages.THROTTLE_ERROR
    else:
        return ErrorMessages.SERVER_ERROR


def format_field_errors(detail):
    """
    Форматирует ошибки полей в понятный для фронтенда формат
    """
    field_errors = {}
    
    for field, errors in detail.items():
        if isinstance(errors, list):
            # Берем первую ошибку для каждого поля
            field_errors[field] = str(errors[0])
        else:
            field_errors[field] = str(errors)
    
    return field_errors


def create_success_response(data=None, message=None):
    """
    Создает стандартизированный успешный ответ
    """
    return {
        'success': True,
        'data': data,
        'message': message
    }
