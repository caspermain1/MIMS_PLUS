from rest_framework import viewsets, status, permissions, generics
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Drogueria
from .serializers import DrogueriaSerializer
from .permissions import IsOwnerOrAdmin


class DrogueriaViewSet(viewsets.ModelViewSet):
    queryset = Drogueria.objects.all()
    serializer_class = DrogueriaSerializer
    permission_classes = [IsOwnerOrAdmin]

    def perform_create(self, serializer):
        # si el usuario no es superuser, asignarlo como propietario
        if not self.request.user.is_superuser and not serializer.validated_data.get('propietario'):
            serializer.save(propietario=self.request.user)
        else:
            serializer.save()

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def mine(self, request):
        """Lista droguerías cuyo propietario es el usuario (o todos si admin)."""
        user = request.user
        if hasattr(user, 'rol') and user.rol == 'admin' or user.is_superuser:
            qs = Drogueria.objects.all()
        else:
            qs = Drogueria.objects.filter(propietario=user)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def set_active(self, request):
        """Set the active_drogueria on the current user.

        Body: { "drogueria": <id> }
        """
        drogueria_id = request.data.get('drogueria')
        if not drogueria_id:
            return Response({'detail': 'drogueria id required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            d = Drogueria.objects.get(pk=drogueria_id)
        except Drogueria.DoesNotExist:
            return Response({'detail': 'Drogueria not found'}, status=status.HTTP_404_NOT_FOUND)

        # si el usuario no es admin y no es propietario, prohibir
        user = request.user
        if not (user.is_superuser or (hasattr(user, 'rol') and user.rol == 'admin') or d.propietario == user):
            return Response({'detail': 'Not allowed to set this drogueria as active'}, status=status.HTTP_403_FORBIDDEN)

        user.active_drogueria = d
        user.save()
        return Response({'detail': f'active drogueria set to {d.codigo}'}, status=status.HTTP_200_OK)
