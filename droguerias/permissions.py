from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allow access only to the owner (propietario) or admin users."""

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Safe methods allowed
        if request.method in permissions.SAFE_METHODS:
            return True
        # Owner or site superuser or role 'admin'
        if hasattr(request.user, 'rol') and request.user.rol == 'admin':
            return True
        if request.user.is_superuser:
            return True
        return obj.propietario == request.user
