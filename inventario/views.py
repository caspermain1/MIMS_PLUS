from rest_framework import viewsets, generics, permissions
from .models import Medicamento, Categoria, MovimientoInventario, Prestamo
from django.db.models import Q
from .serializer import MedicamentoSerializer, CategoriaSerializer, CategoriaConMedicamentosSerializer
from .serializer import (
    MedicamentoSerializer,
    CategoriaSerializer,
    MovimientoInventarioSerializer
)
from .serializers_prestamo import PrestamoSerializer
from .models import Prestamo
from .permissions import EsEmpleadoOPermisoAdmin

# =========================
# 🧩 CRUD DE CATEGORÍAS
# =========================
class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [EsEmpleadoOPermisoAdmin]

    def perform_destroy(self, instance):
        """Inactivar en lugar de eliminar físicamente."""
        instance.activo = False
        instance.save()

# =========================
# 💊 CRUD DE MEDICAMENTOS
# =========================
class MedicamentoViewSet(viewsets.ModelViewSet):
    queryset = Medicamento.objects.all()
    serializer_class = MedicamentoSerializer
    permission_classes = [EsEmpleadoOPermisoAdmin]

    def perform_destroy(self, instance):
        """Inactivar medicamento en lugar de eliminar."""
        instance.estado = False
        instance.save()

# =========================
# 📦 CRUD DE MOVIMIENTOS DE INVENTARIO
# =========================
class MovimientoInventarioViewSet(viewsets.ModelViewSet):
    queryset = MovimientoInventario.objects.all()
    serializer_class = MovimientoInventarioSerializer
    permission_classes = [EsEmpleadoOPermisoAdmin]


class PrestamoViewSet(viewsets.ModelViewSet):
    queryset = Prestamo.objects.all()
    serializer_class = PrestamoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # si es admin o superuser, ver todas
        if getattr(user, 'rol', None) == 'admin' or user.is_superuser:
            return Prestamo.objects.all()
        # si es solicitante mostrar los que solicitó
        return Prestamo.objects.filter(models.Q(solicitante=user) | models.Q(origen__propietario=user) | models.Q(destino__propietario=user))

    def perform_create(self, serializer):
        # el serializer reserva stock durante create
        serializer.save()

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        prestamo = self.get_object()
        user = request.user
        try:
            prestamo.aceptar(user=user)
        except Exception as e:
            return Response({'detail': str(e)}, status=400)
        return Response({'detail': 'Prestamo aceptado'}, status=200)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        prestamo = self.get_object()
        user = request.user
        nota = request.data.get('nota')
        try:
            prestamo.rechazar(user=user, nota=nota)
        except Exception as e:
            return Response({'detail': str(e)}, status=400)
        return Response({'detail': 'Prestamo rechazado'}, status=200)

# =========================
# 🔐 VISTAS BASADAS EN GENERICS
# =========================

# 🔹 Listar medicamentos (solo empleados o admins)
class MedicamentoListView(generics.ListAPIView):
    queryset = Medicamento.objects.filter(estado=True)
    serializer_class = MedicamentoSerializer
    permission_classes = [permissions.IsAuthenticated]

# 🔹 Crear medicamento
class MedicamentoCreateView(generics.CreateAPIView):
    queryset = Medicamento.objects.all()
    serializer_class = MedicamentoSerializer
    permission_classes = [EsEmpleadoOPermisoAdmin]

# 🔹 Ver, actualizar o eliminar medicamento
class MedicamentoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Medicamento.objects.all()
    serializer_class = MedicamentoSerializer
    permission_classes = [EsEmpleadoOPermisoAdmin]

class MedicamentoListPublicAPIView(generics.ListAPIView):
    queryset = Medicamento.objects.filter(estado=True)
    serializer_class = MedicamentoSerializer
    permission_classes = [permissions.AllowAny]

# 🔹 Lista de categorías activas
class CategoriaListPublicAPIView(generics.ListAPIView):
    queryset = Categoria.objects.filter(activo=True)
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.AllowAny]

# 🔹 Opcional: Categorías con sus medicamentos anidados
class CategoriaConMedicamentosListAPIView(generics.ListAPIView):
    queryset = Categoria.objects.filter(activo=True)
    serializer_class = CategoriaConMedicamentosSerializer
    permission_classes = [permissions.AllowAny]


class MedicamentosByDrogueriaListAPIView(generics.ListAPIView):
    """Lista medicamentos filtrados por drogueria (query param: ?drogueria=<id>)."""
    serializer_class = MedicamentoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        drogueria_id = self.request.query_params.get('drogueria')
        qs = Medicamento.objects.filter(estado=True)
        if drogueria_id:
            qs = qs.filter(drogueria_id=drogueria_id)
        return qs
