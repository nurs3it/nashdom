"""
Миксины для стандартизации ответов API
"""

from rest_framework.response import Response
from rest_framework import status
from .exceptions import create_success_response


class StandardResponseMixin:
    """
    Миксин для стандартизации ответов API
    """
    
    def success_response(self, data=None, message=None, status_code=status.HTTP_200_OK):
        """Создает стандартизированный успешный ответ"""
        response_data = create_success_response(data=data, message=message)
        return Response(response_data, status=status_code)
    
    def created_response(self, data=None, message="Объект успешно создан"):
        """Ответ для успешного создания объекта"""
        return self.success_response(data=data, message=message, status_code=status.HTTP_201_CREATED)
    
    def updated_response(self, data=None, message="Объект успешно обновлен"):
        """Ответ для успешного обновления объекта"""
        return self.success_response(data=data, message=message)
    
    def deleted_response(self, message="Объект успешно удален"):
        """Ответ для успешного удаления объекта"""
        return self.success_response(message=message, status_code=status.HTTP_204_NO_CONTENT)


class ErrorResponseMixin:
    """
    Миксин для создания стандартизированных ошибок
    """
    
    def validation_error_response(self, field_errors, message="Проверьте правильность заполнения полей"):
        """Создает ответ с ошибками валидации"""
        from rest_framework.exceptions import ValidationError
        raise ValidationError(field_errors)
    
    def permission_error_response(self, message="У вас нет прав для выполнения этого действия"):
        """Создает ответ с ошибкой прав доступа"""
        from rest_framework.exceptions import PermissionDenied
        raise PermissionDenied(message)
    
    def not_found_error_response(self, message="Запрашиваемый объект не найден"):
        """Создает ответ с ошибкой "не найдено" """
        from rest_framework.exceptions import NotFound
        raise NotFound(message)
