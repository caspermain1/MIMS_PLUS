from rest_framework import permissions

class EsEmpleadoOPermisoAdmin(permissions.BasePermission):
    """
    Permite acceso a empleados o administradores
    """

    def has_permission(self, request, view):
        return bool(
            request.user and (
                request.user.is_staff or request.user.rol in ["empleado", "admin"]
            )
        )
