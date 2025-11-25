from rest_framework.test import APITestCase
from usuarios.models import Usuario
from droguerias.models import Drogueria
from .models import Medicamento


class InventarioFilterTests(APITestCase):
    def setUp(self):
        self.user = Usuario.objects.create_user(username='u1', password='x', email='u1@example.com')
        self.d1 = Drogueria.objects.create(codigo='D1', nombre='Sucursal 1', propietario=self.user)
        self.d2 = Drogueria.objects.create(codigo='D2', nombre='Sucursal 2', propietario=self.user)
        Medicamento.objects.create(nombre='MedA', precio_venta=10.0, stock_actual=5, drogueria=self.d1)
        Medicamento.objects.create(nombre='MedB', precio_venta=20.0, stock_actual=3, drogueria=self.d2)

    def test_list_medicamentos_by_drogueria(self):
        self.client.force_authenticate(self.user)
        resp = self.client.get('/api/inventario/by-drogueria/?drogueria=%d' % self.d1.id)
        assert resp.status_code == 200, resp.content
        data = resp.json()
        assert isinstance(data, list)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['nombre'], 'MedA')


class PrestamoFlowTests(APITestCase):
    def setUp(self):
        self.user = Usuario.objects.create_user(username='owner', password='x', email='owner@example.com')
        # crear droguerias y medicamentos por drogueria
        self.d1 = Drogueria.objects.create(codigo='S1', nombre='Sucursal 1', propietario=self.user)
        self.d2 = Drogueria.objects.create(codigo='S2', nombre='Sucursal 2', propietario=self.user)
        self.m1 = Medicamento.objects.create(nombre='Paracetamol', precio_venta=5.0, stock_actual=20, drogueria=self.d1)
        self.m2 = Medicamento.objects.create(nombre='Paracetamol', precio_venta=5.0, stock_actual=2, drogueria=self.d2)

    def test_prestamo_reserva_and_accept(self):
        self.client.force_authenticate(self.user)
        # crear solicitud para transferir 5 unidades desde d1 a d2
        resp = self.client.post('/api/inventario/prestamos/', data={
            'medicamento_origen': self.m1.id,
            'cantidad': 5,
            'origen': self.d1.id,
            'destino': self.d2.id
        }, format='json')
        assert resp.status_code == 201, resp.content
        data = resp.json()
        prestamo_id = data['id']

        # verificar reserva
        self.m1.refresh_from_db()
        self.assertEqual(self.m1.stock_reservado, 5)

        # aceptar la solicitud
        resp2 = self.client.post(f'/api/inventario/prestamos/{prestamo_id}/accept/')
        assert resp2.status_code == 200, resp2.content

        # verificar efecto en stock
        self.m1.refresh_from_db()
        self.m2.refresh_from_db()
        self.assertEqual(self.m1.stock_actual, 15)
        self.assertEqual(self.m1.stock_reservado, 0)
        self.assertEqual(self.m2.stock_actual, 7)

from django.test import TestCase

# Create your tests here.
