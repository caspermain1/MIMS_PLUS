from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario

@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    model = Usuario
    list_display = ('username', 'email', 'rol', 'is_staff', 'is_active', 'fecha_creacion')
    list_filter = ('rol', 'is_staff', 'is_active')
    search_fields = ('username', 'email', 'nombre_completo')
    ordering = ('username',)

    # 🔹 ESTA LÍNEA ES LA CLAVE: evita el error con los campos no editables
    readonly_fields = ('fecha_creacion', 'actualizado')

    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Información personal', {
            'fields': (
                'nombre_completo',
                'email',
                'telefono',
                'direccion',
            )
        }),
        ('Rol y permisos', {
            'fields': (
                'rol',
                'is_staff',
                'is_active',
                'is_superuser',
                'groups',
                'user_permissions',
            )
        }),
        ('Fechas importantes', {
            'fields': (
                'last_login',
                'fecha_creacion',
                'actualizado',
            )
        }),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username',
                'email',
                'password1',
                'password2',
                'nombre_completo',
                'telefono',
                'direccion',
                'rol',
                'is_staff',
                'is_active',
            ),
        }),
    )
