from rest_framework import serializers
from .models import Medicamento, Categoria, MovimientoInventario

# ==========================
# 🧩 SERIALIZER DE CATEGORÍA
# ==========================
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'descripcion', 'activo']

# ==========================
# 💊 SERIALIZER DE MEDICAMENTO
# ==========================
class MedicamentoSerializer(serializers.ModelSerializer):
    # Mostrar información de categoría
    categoria = CategoriaSerializer(read_only=True)
    # Permitir enviar solo el ID al crear/editar
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(),
        source='categoria',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Medicamento
        fields = [
            'id',
            'nombre',
            'descripcion',
            'precio_venta',
            'stock_actual',
            'stock_minimo',
            'categoria',
            'categoria_id',
            'fecha_vencimiento',
            'estado',
            'imagen_url',
        ]

    def to_representation(self, instance):
        """Personaliza la salida para el frontend."""
        data = super().to_representation(instance)
        # Simplificar categoría si existe
        if instance.categoria:
            data['categoria'] = {
                'id': instance.categoria.id,
                'nombre': instance.categoria.nombre
            }
        else:
            data['categoria'] = None

        # Forzar formatos seguros
        data['precio_venta'] = str(instance.precio_venta or "0.00")
        data['stock_actual'] = instance.stock_actual or 0
        data['stock_minimo'] = instance.stock_minimo or 0
        data['fecha_vencimiento'] = instance.fecha_vencimiento.isoformat() if instance.fecha_vencimiento else None

        return data

# ===================================
# 📦 SERIALIZER DE MOVIMIENTO INVENTARIO
# ===================================
class MovimientoInventarioSerializer(serializers.ModelSerializer):
    medicamento = MedicamentoSerializer(read_only=True)
    medicamento_id = serializers.PrimaryKeyRelatedField(
        queryset=Medicamento.objects.all(),
        source='medicamento',
        write_only=True,
        required=True
    )

    class Meta:
        model = MovimientoInventario
        fields = [
            'id',
            'tipo_movimiento',
            'cantidad',
            'fecha_movimiento',
            'medicamento',
            'medicamento_id',
        ]

        # Serializer básico de categoría
class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'descripcion', 'activo']

# Serializer de medicamentos
class MedicamentoSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(),
        source='categoria',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Medicamento
        fields = [
            'id', 'nombre', 'descripcion', 'precio_venta',
            'stock_actual', 'stock_minimo', 'categoria',
            'categoria_id', 'fecha_vencimiento', 'estado',
            'imagen_url'
        ]

# Serializer para categorías con sus medicamentos anidados
class CategoriaConMedicamentosSerializer(serializers.ModelSerializer):
    # Usa el serializer de medicamentos, solo lectura
    medicamentos = MedicamentoSerializer(many=True, read_only=True)

    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'descripcion', 'activo', 'medicamentos']
