from django.contrib import admin
from .models import Categoria, Medicamento, MovimientoInventario

# =========================
# 📁 Categoría
# =========================
@admin.register(Categoria)
class CategoriaAdmin(admin.ModelAdmin):
    list_display = ('id', 'nombre', 'descripcion', 'activo')
    list_filter = ('activo',)
    search_fields = ('nombre', 'descripcion')
    ordering = ('nombre',)


# =========================
# 🔄 Inline para movimientos dentro del medicamento
# =========================
class MovimientoInventarioInline(admin.TabularInline):
    model = MovimientoInventario
    extra = 1
    readonly_fields = ('fecha_movimiento',)
    can_delete = True


# =========================
# 💊 Medicamento con CRUD completo
# =========================
@admin.register(Medicamento)
class MedicamentoAdmin(admin.ModelAdmin):
    list_display = (
        'nombre', 'categoria', 'precio_venta', 'stock_actual', 
        'stock_minimo', 'estado', 'esta_vencido', 'verificar_stock'
    )
    list_filter = ('categoria', 'estado')
    search_fields = ('nombre', 'descripcion')
    inlines = [MovimientoInventarioInline]
    readonly_fields = ('verificar_stock', 'esta_vencido')
    ordering = ('nombre',)


# =========================
# 🚚 Movimiento de Inventario (CRUD independiente)
# =========================
@admin.register(MovimientoInventario)
class MovimientoInventarioAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'medicamento', 'tipo_movimiento', 'cantidad', 
        'fecha_movimiento', 'usuario', 'observacion'
    )
    list_filter = ('tipo_movimiento', 'fecha_movimiento', 'usuario')
    search_fields = ('medicamento__nombre', 'usuario__username', 'observacion')
    readonly_fields = ('fecha_movimiento',)
