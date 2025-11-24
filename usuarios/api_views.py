from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .models import Usuario
from .serializer import UsuarioSerializer

class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        user = authenticate(username=username, password=password)
        if user is not None:
            serializer = UsuarioSerializer(user)
            return Response({
                "message": "Login exitoso",
                "user": serializer.data,
                "rol": user.rol  # enviamos el rol
            })
        else:
            return Response({"error": "Credenciales incorrectas"}, status=status.HTTP_401_UNAUTHORIZED)
