from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

class Usuario(AbstractUser):
    ROL_CHOICES = [
        ('admin', 'Administrador'),
        ('empleado', 'Empleado'),
        ('cliente', 'Cliente'),
    ]

    num_doc = models.CharField(max_length=20, unique=True, null=True, blank=True)
    cod_recuperacion = models.CharField(max_length=100, blank=True, null=True)  # 🔑 para recuperar contraseña
    nombre_completo = models.CharField(max_length=100, blank=True, null=True)
    telefono = models.CharField(max_length=15, blank=True, null=True)
    direccion = models.CharField(max_length=200, blank=True, null=True)
    rol = models.CharField(max_length=20, choices=ROL_CHOICES, default='cliente')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return f"{self.username} ({self.rol})"

    # ✅ Método para generar código de recuperación
    def generar_codigo_recuperacion(self):
        self.cod_recuperacion = str(uuid.uuid4())[:8]
        self.save()
#class rol model
class Rol(models.Model):
    nombre = models.CharField(max_length=50, unique=True)
    descripcion = models.TextField(blank=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre
