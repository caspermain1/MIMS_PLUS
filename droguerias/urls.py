from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DrogueriaViewSet

router = DefaultRouter()
router.register(r'', DrogueriaViewSet, basename='drogueria')

urlpatterns = [
    path('', include(router.urls)),
]
