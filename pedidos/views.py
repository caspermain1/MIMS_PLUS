from rest_framework import status, generics, permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Pedido, DetallePedido
from .serializers import PedidoSerializer

# =========================
# 🔹 CRUD AUTOMÁTICO (ViewSet)
# =========================
class PedidoViewSet(viewsets.ModelViewSet):
    """
    CRUD completo para pedidos con soporte automático:
    - listar
    - crear
    - ver detalle
    - actualizar
    - eliminar (cambia estado a 'cancelado')
    """
    queryset = Pedido.objects.all().order_by("-fecha_creacion")
    serializer_class = PedidoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_destroy(self, instance):
        """Inactivar pedido en lugar de eliminar físicamente."""
        instance.estado = "cancelado"
        instance.save()

# =========================
# 🔹 CREAR PEDIDO PERSONALIZADO
# =========================
class CrearPedidoView(APIView):
    """
    Crea un pedido con detalles incluidos.
    Ejemplo JSON:
    {
        "cliente": 1,
        "detalles_data": [
            {"medicamento": 2, "cantidad": 3},
            {"medicamento": 5, "cantidad": 1}
        ]
    }
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def post(self, request):
        serializer = PedidoSerializer(data=request.data)
        if serializer.is_valid():
            pedido = serializer.save()

            # Crear detalles manualmente si vienen en el cuerpo
            detalles_data = request.data.get("detalles_data", [])
            for d in detalles_data:
                DetallePedido.objects.create(
                    pedido=pedido,
                    medicamento_id=d.get("medicamento"),
                    cantidad=d.get("cantidad", 1)
                )

            return Response(PedidoSerializer(pedido).data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# =========================
# 🔹 LISTAR PEDIDOS
# =========================
class ListaPedidosView(APIView):
    """
    Lista todos los pedidos con sus detalles.
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get(self, request):
        pedidos = Pedido.objects.all().order_by("-fecha_creacion")
        serializer = PedidoSerializer(pedidos, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# =========================
# 🔹 ACTUALIZAR PEDIDO + DETALLES
# =========================
class ActualizarPedidoView(APIView):
    """
    Actualiza pedido y sus detalles (reemplazándolos).
    """
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def put(self, request, pk):
        try:
            pedido = Pedido.objects.get(pk=pk)
        except Pedido.DoesNotExist:
            return Response({"error": "Pedido no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        serializer = PedidoSerializer(pedido, data=request.data, partial=True)
        if serializer.is_valid():
            pedido = serializer.save()

            # Si hay detalles, se reemplazan
            detalles_data = request.data.get("detalles_data", None)
            if detalles_data is not None:
                pedido.detalles.all().delete() # type: ignore
                for d in detalles_data:
                    DetallePedido.objects.create(
                        pedido=pedido,
                        medicamento_id=d.get("medicamento"),
                        cantidad=d.get("cantidad", 1)
                    )

            return Response(PedidoSerializer(pedido).data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
