from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def generar_pdf_factura(factura):
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter

    c.setFont("Helvetica-Bold", 16)
    c.drawString(50, height - 50, f"Factura #{factura.id}")

    c.setFont("Helvetica", 12)
    c.drawString(50, height - 80, f"Cliente: {factura.cliente.nombre_completo or factura.cliente.username}")
    c.drawString(50, height - 100, f"Fecha: {factura.fecha_emision.strftime('%Y-%m-%d %H:%M:%S')}")
    c.drawString(50, height - 120, f"Método de pago: {factura.metodo_pago}")
    c.drawString(50, height - 140, f"Dirección de entrega: {factura.direccion_entrega}")
    c.drawString(50, height - 160, f"Observaciones: {factura.observaciones or 'N/A'}")

    # Tabla de detalles
    y = height - 200
    c.drawString(50, y, "Medicamento")
    c.drawString(250, y, "Cantidad")
    c.drawString(350, y, "Precio Unitario")
    c.drawString(470, y, "Subtotal")
    y -= 20

    for d in factura.detalles.all():
        c.drawString(50, y, d.medicamento.nombre)
        c.drawString(250, y, str(d.cantidad))
        c.drawString(350, y, f"{d.precio_unitario:.2f}")
        c.drawString(470, y, f"{d.subtotal:.2f}")
        y -= 20

    y -= 10
    c.drawString(50, y, f"Total: {factura.total:.2f}")

    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer
