from django.db import models
from django.utils import timezone
from usuarios.models import Usuario


class Drogueria(models.Model):
    """Representa una droguería / sucursal asociada a un propietario (Usuario).

    Campos clave:
    - nombre: nombre público de la droguería
    - codigo: código corto único (ej: D001)
    - direccion, ciudad, telefono, email
    - propietario: FK a Usuario (opcional)
    - activo: si la sucursal está activa
    - creado/actualizado

    Este modelo permitirá asociar inventario y movimientos a una ubicación.
    """

    nombre = models.CharField(max_length=150)
    codigo = models.CharField(max_length=30, unique=True)
    direccion = models.CharField(max_length=255, blank=True, null=True)
    ciudad = models.CharField(max_length=100, blank=True, null=True)
    telefono = models.CharField(max_length=30, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    propietario = models.ForeignKey(Usuario, on_delete=models.SET_NULL, null=True, blank=True, related_name='droguerias')
    activo = models.BooleanField(default=True)
    creado = models.DateTimeField(auto_now_add=True)
    actualizado = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['codigo', 'nombre']
        verbose_name = 'Droguería'
        verbose_name_plural = 'Droguerías'

    def __str__(self):
        return f"{self.codigo} — {self.nombre}"
