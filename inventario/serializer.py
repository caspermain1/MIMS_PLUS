from rest_framework import serializers
from .models import Medicamento, Categoria, MovimientoInventario
from droguerias.models import Drogueria


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'descripcion', 'activo']


class DrogueriaNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = Drogueria
        fields = ['id', 'codigo', 'nombre']


class MedicamentoSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)
    categoria_id = serializers.PrimaryKeyRelatedField(queryset=Categoria.objects.all(), source='categoria', write_only=True, required=False, allow_null=True)

    drogueria = DrogueriaNestedSerializer(read_only=True)
    drogueria_id = serializers.PrimaryKeyRelatedField(queryset=Drogueria.objects.all(), source='drogueria', write_only=True, required=False, allow_null=True)

    class Meta:
        model = Medicamento
        fields = [
            'id', 'nombre', 'descripcion', 'precio_venta', 'costo_compra',
            'stock_actual', 'stock_reservado', 'stock_minimo', 'categoria', 'categoria_id',
            'fecha_vencimiento', 'estado', 'imagen_url', 'drogueria', 'drogueria_id',
            'lote', 'fecha_ingreso', 'proveedor', 'codigo_barra', 'ubicacion'
        ]

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # consistent formatting
        data['precio_venta'] = str(instance.precio_venta or "0.00")
        data['costo_compra'] = str(instance.costo_compra or "0.00")
        data['stock_actual'] = instance.stock_actual or 0
        data['stock_reservado'] = instance.stock_reservado or 0
        data['stock_minimo'] = instance.stock_minimo or 0
        data['fecha_vencimiento'] = instance.fecha_vencimiento.isoformat() if instance.fecha_vencimiento else None
        return data


class MovimientoInventarioSerializer(serializers.ModelSerializer):
    medicamento = MedicamentoSerializer(read_only=True)
    medicamento_id = serializers.PrimaryKeyRelatedField(queryset=Medicamento.objects.all(), source='medicamento', write_only=True, required=True)
    drogueria = serializers.PrimaryKeyRelatedField(queryset=Drogueria.objects.all(), source='drogueria', write_only=True, required=False, allow_null=True)

    class Meta:
        model = MovimientoInventario
        fields = ['id', 'tipo_movimiento', 'cantidad', 'fecha_movimiento', 'medicamento', 'medicamento_id', 'drogueria']


class CategoriaConMedicamentosSerializer(serializers.ModelSerializer):
    medicamentos = MedicamentoSerializer(many=True, read_only=True)

    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'descripcion', 'activo', 'medicamentos']
