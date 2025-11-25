from rest_framework import viewsets, generics, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Medicamento, Categoria, MovimientoInventario, Prestamo
from django.db.models import Q
from .filters import (
    apply_medicamento_filters,
    apply_movimiento_filters,
    apply_prestamo_filters,
    apply_alerta_filters,
    apply_audit_filters,
)
from .serializer import (
    MedicamentoSerializer,
    CategoriaSerializer,
    CategoriaConMedicamentosSerializer,
    MovimientoInventarioSerializer,
)
from .serializers_prestamo import PrestamoSerializer
from .models import Prestamo
from .permissions import EsEmpleadoOPermisoAdmin
from .serializer import AlertaSerializer, AuditLogSerializer
from .models import Alerta, AuditLog
from rest_framework import mixins
from .pagination import StandardResultsSetPagination
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.response import Response
from .serializer import DrogueriaNestedSerializer
from droguerias.models import Drogueria

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

    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion', 'codigo_barra']
    ordering_fields = ['precio_venta', 'stock_actual', 'nombre']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = super().get_queryset()
        nombre = self.request.query_params.get('nombre')
        categoria = self.request.query_params.get('categoria')
        drogueria = self.request.query_params.get('drogueria')
        estado = self.request.query_params.get('estado')

        return apply_medicamento_filters(qs, self.request.query_params)

# =========================
# 📦 CRUD DE MOVIMIENTOS DE INVENTARIO
# =========================
class MovimientoInventarioViewSet(viewsets.ModelViewSet):
    queryset = MovimientoInventario.objects.all()
    serializer_class = MovimientoInventarioSerializer
    permission_classes = [EsEmpleadoOPermisoAdmin]

    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['fecha_movimiento', 'cantidad']
    ordering = ('-fecha_movimiento',)
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = super().get_queryset()
        medicamento = self.request.query_params.get('medicamento')
        drogueria = self.request.query_params.get('drogueria')
        tipo = self.request.query_params.get('tipo_movimiento')
        fecha_from = self.request.query_params.get('fecha_from')
        fecha_to = self.request.query_params.get('fecha_to')

        return apply_movimiento_filters(qs, self.request.query_params)


class PrestamoViewSet(viewsets.ModelViewSet):
    queryset = Prestamo.objects.all()
    serializer_class = PrestamoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # base queryset según permisos
        if getattr(user, 'rol', None) == 'admin' or user.is_superuser:
            qs = Prestamo.objects.all()
        else:
            qs = Prestamo.objects.filter(Q(solicitante=user) | Q(origen__propietario=user) | Q(destino__propietario=user))

        # query params: estado, origen, destino, solicitante
        estado = self.request.query_params.get('estado')
        origen = self.request.query_params.get('origen')
        destino = self.request.query_params.get('destino')
        solicitante = self.request.query_params.get('solicitante')

        if estado:
            qs = qs.filter(estado=estado)
        if origen:
            qs = qs.filter(origen_id=origen)
        return apply_prestamo_filters(qs, self.request.query_params)

    def perform_create(self, serializer):
        # el serializer reserva stock durante create
        serializer.save()

    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        prestamo = self.get_object()
        user = request.user
        # permiso: solo el propietario de la drogueria destino, o admin/superuser, o propietario de origen
        allowed = (
            user.is_superuser or
            getattr(user, 'rol', None) == 'admin' or
            (prestamo.destino and getattr(prestamo.destino, 'propietario', None) == user) or
            (prestamo.origen and getattr(prestamo.origen, 'propietario', None) == user)
        )
        if not allowed:
            return Response({'detail': 'No autorizado para aceptar este prestamo'}, status=403)
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
        # permiso: similar a accept
        allowed = (
            user.is_superuser or
            getattr(user, 'rol', None) == 'admin' or
            (prestamo.destino and getattr(prestamo.destino, 'propietario', None) == user) or
            (prestamo.origen and getattr(prestamo.origen, 'propietario', None) == user)
        )
        if not allowed:
            return Response({'detail': 'No autorizado para rechazar este prestamo'}, status=403)
        try:
            prestamo.rechazar(user=user, nota=nota)
        except Exception as e:
            return Response({'detail': str(e)}, status=400)
        return Response({'detail': 'Prestamo rechazado'}, status=200)


class AlertaViewSet(viewsets.ReadOnlyModelViewSet):
    """List and retrieve alerts; allow marking as read via action.

    - list: returns alerts belonging to droguerias the user owns or all if admin
    - retrieve: details
    - mark_read (POST): mark a specific alert as read
    """
    queryset = Alerta.objects.all()
    serializer_class = AlertaSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_anonymous:
            return Alerta.objects.none()
        if user.is_superuser or getattr(user, 'rol', None) == 'admin':
            qs = Alerta.objects.all()
        else:
            # owner: alerts related to droguerias he owns
            qs = Alerta.objects.filter(drogueria__propietario=user)

        # simple filters
        tipo = self.request.query_params.get('tipo')
        nivel = self.request.query_params.get('nivel')
        leido = self.request.query_params.get('leido')
        return apply_alerta_filters(qs, self.request.query_params)
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['creado_en', 'nivel']
    pagination_class = StandardResultsSetPagination
    ordering = ('-creado_en',)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def mark_read(self, request, pk=None):
        alert = self.get_object()
        alert.leido = True
        alert.save()
        return Response({'detail': 'marked'}, status=200)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer

    def get_queryset(self):
        user = self.request.user
        # only admin or superuser can view audit logs
        if not (user.is_superuser or getattr(user, 'rol', None) == 'admin'):
            return AuditLog.objects.none()
        qs = super().get_queryset()
        action = self.request.query_params.get('action')
        model_name = self.request.query_params.get('model_name')
        user_id = self.request.query_params.get('user')
        object_id = self.request.query_params.get('object_id')
        created_from = self.request.query_params.get('created_from')
        created_to = self.request.query_params.get('created_to')

        return apply_audit_filters(qs, self.request.query_params)
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'action', 'model_name']
    pagination_class = StandardResultsSetPagination
    ordering = ('-created_at',)

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
    # permitir búsqueda simple, orden y paginación en el catálogo público
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['nombre', 'descripcion', 'codigo_barra', 'proveedor']
    ordering_fields = ['precio_venta', 'stock_actual', 'nombre']
    pagination_class = StandardResultsSetPagination

    def get_queryset(self):
        qs = Medicamento.objects.filter(estado=True)
        return apply_medicamento_filters(qs, self.request.query_params)

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


class ProveedoresListAPIView(generics.ListAPIView):
    """Devuelve lista de proveedores (distintos) — útil para autocomplete.

    Query params:
    - q: término de búsqueda (opcional)
    """
    permission_classes = [permissions.AllowAny]
    pagination_class = StandardResultsSetPagination

    def list(self, request, *args, **kwargs):
        q = request.query_params.get('q')
        qs = Medicamento.objects.values_list('proveedor', flat=True).distinct()
        if q:
            qs = qs.filter(proveedor__icontains=q)
        # corregir None/""
        qs = qs.exclude(proveedor__isnull=True).exclude(proveedor__exact='')
        # paginar manualmente usando la paginación del generics
        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response(list(page))
        return Response(list(qs), status=status.HTTP_200_OK)


class DrogueriasListPublicAPIView(generics.ListAPIView):
    """Lista líquida de droguerías pública (para selector en UI)."""
    queryset = Drogueria.objects.all()
    serializer_class = DrogueriaNestedSerializer
    permission_classes = [permissions.AllowAny]
