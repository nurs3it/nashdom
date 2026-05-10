from rest_framework import permissions


class IsOwnerOrReadOnly(permissions.BasePermission):
    """
    Разрешение, которое позволяет редактировать объект только его владельцу.
    """
    
    def has_object_permission(self, request, view, obj):
        # Разрешения на чтение для всех
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Разрешения на запись только для владельца объекта
        return obj.owner == request.user


class IsOwnerOrSuperAdmin(permissions.BasePermission):
    """
    Разрешение для владельца объекта или супер-администратора.
    """
    
    def has_object_permission(self, request, view, obj):
        # Супер-администратор может все
        if request.user.is_staff or request.user.role == 'superadmin':
            return True
        
        # Владелец может редактировать свои объекты
        return obj.owner == request.user


class IsSuperAdminUser(permissions.BasePermission):
    """
    Разрешение только для супер-администраторов.
    """
    
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_staff or request.user.role == 'superadmin')
        )


class IsOwner(permissions.BasePermission):
    """
    Разрешение только для владельца объекта.
    """
    
    def has_object_permission(self, request, view, obj):
        return obj.owner == request.user


class IsRealtorOrSuperAdmin(permissions.BasePermission):
    """
    Разрешение для риелторов и супер-администраторов.
    """
    
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role in ['realtor', 'superadmin'] or request.user.is_staff)
        )
