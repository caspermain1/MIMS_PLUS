from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PedidoViewSet, CrearPedidoView, ListaPedidosView, ActualizarPedidoView

router = DefaultRouter()
router.register(r'crud', PedidoViewSet, basename='pedido')

urlpatterns = [
    # CRUD automático
    path('', include(router.urls)),

    # Vistas personalizadas
    path('crear/', CrearPedidoView.as_view(), name='pedido_crear'),
    path('listar/', ListaPedidosView.as_view(), name='pedido_listar'),
    path('actualizar/<int:pk>/', ActualizarPedidoView.as_view(), name='pedido_actualizar'),
]
