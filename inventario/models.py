from django.db import models
from django.utils import timezone
from usuarios.models import Usuario  # relación con usuarios

# =========================
# 🧩 CATEGORÍA DE MEDICAMENTOS
# =========================
class Categoria(models.Model):
    nombre = models.CharField(max_length=100, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre


# =========================
# 💊 MEDICAMENTO
# =========================
class Medicamento(models.Model):
    nombre = models.CharField(max_length=150, unique=True)
    descripcion = models.TextField(blank=True, null=True)
    categoria = models.ForeignKey(
        Categoria,
        on_delete=models.SET_NULL,
        null=True,
        related_name="medicamentos"
    )
    precio_venta = models.DecimalField(max_digits=10, decimal_places=2)
    stock_actual = models.PositiveIntegerField(default=0)
    stock_minimo = models.PositiveIntegerField(default=10)
    fecha_vencimiento = models.DateField(null=True, blank=True)
    estado = models.BooleanField(default=True)
    imagen_url = models.CharField(max_length=500, blank=True, null=True)

    def __str__(self):
        return self.nombre

    # =========================
    # Métodos de utilidad
    # =========================
    def verificar_stock(self):
        """Verifica si el stock está por debajo del mínimo."""
        return "Bajo stock ⚠️" if self.stock_actual <= self.stock_minimo else "Stock suficiente ✅"

    def esta_vencido(self):
        """Comprueba si el medicamento está vencido."""
        return bool(self.fecha_vencimiento and self.fecha_vencimiento < timezone.now().date())


# =========================
# 📦 MOVIMIENTOS DE INVENTARIO
# =========================
class MovimientoInventario(models.Model):
    TIPO_MOVIMIENTO = [
        ("entrada", "Entrada"),
        ("salida", "Salida"),
        ("ajuste", "Ajuste"),
    ]

    medicamento = models.ForeignKey(
        Medicamento,
        on_delete=models.CASCADE,
        related_name="movimientos"
    )
    tipo_movimiento = models.CharField(max_length=10, choices=TIPO_MOVIMIENTO)
    cantidad = models.PositiveIntegerField()
    fecha_movimiento = models.DateTimeField(default=timezone.now)
    usuario = models.ForeignKey(
        Usuario,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    observacion = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.tipo_movimiento.title()} - {self.medicamento.nombre} ({self.cantidad})"

    # =========================
    # Actualiza stock al guardar
    # =========================
    def save(self, *args, **kwargs):
        """Ajusta automáticamente el stock del medicamento."""
        if not self.pk:  # solo al crear el movimiento
            if self.tipo_movimiento == "entrada":
                self.medicamento.stock_actual += self.cantidad
            elif self.tipo_movimiento == "salida":
                self.medicamento.stock_actual -= self.cantidad
            self.medicamento.save()
        super().save(*args, **kwargs)
