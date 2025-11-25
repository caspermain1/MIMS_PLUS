from rest_framework import serializers
from .models import Drogueria


class DrogueriaSerializer(serializers.ModelSerializer):
    propietario_username = serializers.CharField(source='propietario.username', read_only=True)

    class Meta:
        model = Drogueria
        fields = [
            'id', 'codigo', 'nombre', 'direccion', 'ciudad', 'telefono', 'email',
            'propietario', 'propietario_username', 'activo', 'creado', 'actualizado'
        ]
        read_only_fields = ('creado', 'actualizado')
