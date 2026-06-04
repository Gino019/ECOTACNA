package com.GAKOM_ECOTACNA.ECOTACNA.service;

import com.GAKOM_ECOTACNA.ECOTACNA.model.Company;
import com.GAKOM_ECOTACNA.ECOTACNA.model.PickupRequest;
import com.GAKOM_ECOTACNA.ECOTACNA.model.TransportUnit;
import com.GAKOM_ECOTACNA.ECOTACNA.model.User;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class ConstanciaPdfService {

    private static final DeviceRgb ECO_GREEN = new DeviceRgb(34, 120, 74);
    private static final DeviceRgb ECO_DARK = new DeviceRgb(22, 78, 48);
    private static final DeviceRgb LIGHT_GREEN_BG = new DeviceRgb(240, 253, 244);
    private static final DeviceRgb TABLE_HEADER_BG = new DeviceRgb(34, 120, 74);
    private static final DeviceRgb LIGHT_GRAY = new DeviceRgb(243, 244, 246);
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter FMT_DATE = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    /**
     * Genera un PDF de constancia de recojo y pago.
     * @return bytes del PDF generado
     */
    public byte[] generarConstancia(PickupRequest request, Company generadora,
                                     User collectorUser, Company recolectora,
                                     TransportUnit transportUnit,
                                     String codigoConstancia) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf);
            doc.setMargins(40, 40, 40, 40);

            // ── Encabezado ──
            addHeader(doc, codigoConstancia);

            // ── Sección: Datos del Generador ──
            addSectionTitle(doc, "DATOS DEL GENERADOR / RESTAURANTE");
            Table tGen = createDataTable();
            addDataRow(tGen, "Razón social", generadora.getBusinessName());
            addDataRow(tGen, "RUC", generadora.getRuc());
            addDataRow(tGen, "Dirección", generadora.getAddress());
            doc.add(tGen);
            addSpacer(doc);

            // ── Sección: Datos del Recolector ──
            addSectionTitle(doc, "DATOS DEL RECOLECTOR");
            Table tRec = createDataTable();
            addDataRow(tRec, "Razón social", recolectora != null ? recolectora.getBusinessName() : "—");
            addDataRow(tRec, "RUC", recolectora != null ? recolectora.getRuc() : "—");
            if (collectorUser != null) {
                addDataRow(tRec, "Correo", collectorUser.getEmail());
                addDataRow(tRec, "Nombre", collectorUser.getFirstName() + " " + collectorUser.getLastName());
            }
            doc.add(tRec);
            addSpacer(doc);

            // ── Sección: Datos de la Unidad Vehicular ──
            addSectionTitle(doc, "DATOS DE LA UNIDAD VEHICULAR");
            Table tUnit = createDataTable();
            if (transportUnit != null) {
                addDataRow(tUnit, "Placa", transportUnit.getPlate());
                addDataRow(tUnit, "Marca", transportUnit.getBrand() != null ? transportUnit.getBrand() : "—");
                addDataRow(tUnit, "Modelo", transportUnit.getModel() != null ? transportUnit.getModel() : "—");
                addDataRow(tUnit, "Tipo de unidad", transportUnit.getUnitType() != null ? transportUnit.getUnitType() : "—");
                addDataRow(tUnit, "Capacidad", transportUnit.getCapacityLiters() + " litros");
            } else {
                addDataRow(tUnit, "Unidad", "No registrada");
            }
            doc.add(tUnit);
            addSpacer(doc);

            // ── Sección: Datos del Recojo ──
            addSectionTitle(doc, "DATOS DEL RECOJO");
            Table tRecojo = createDataTable();
            addDataRow(tRecojo, "Solicitud N°", String.valueOf(request.getId()));
            addDataRow(tRecojo, "Estado", request.getStatus().name());
            addDataRow(tRecojo, "Fecha programada", formatDate(request.getScheduledAt()));
            addDataRow(tRecojo, "Fecha de confirmación", formatDate(request.getFechaConfirmacionPago()));
            addDataRow(tRecojo, "Dirección de recojo", request.getDireccion() != null ? request.getDireccion() : "—");
            addDataRow(tRecojo, "Volumen aproximado", formatVolume(request.getApproximateVolumeLiters()));
            if (request.getObservaciones() != null && !request.getObservaciones().isBlank()) {
                addDataRow(tRecojo, "Observaciones", request.getObservaciones());
            }
            doc.add(tRecojo);
            addSpacer(doc);

            // ── Sección: Resumen de Pago Operativo ──
            addSectionTitle(doc, "RESUMEN DE PAGO OPERATIVO");
            Table tPago = createPaymentSummaryTable(request);
            doc.add(tPago);
            addSpacer(doc);

            // ── Texto legal ──
            doc.add(new Paragraph("")
                    .setMarginTop(10));

            Paragraph legal = new Paragraph(
                    "Esta constancia acredita el recojo de aceite vegetal usado registrado en la plataforma EcoTacna. " +
                    "Los datos contenidos corresponden a la información registrada al momento de la confirmación del pago operativo.")
                    .setFontSize(9)
                    .setFontColor(new DeviceRgb(107, 114, 128))
                    .setTextAlignment(TextAlignment.JUSTIFIED)
                    .setPadding(12)
                    .setBackgroundColor(LIGHT_GREEN_BG)
                    .setBorderLeft(new SolidBorder(ECO_GREEN, 3));
            doc.add(legal);

            // ── Pie de página ──
            doc.add(new Paragraph("EcoTacna — Plataforma de Gestión de Aceite Vegetal Usado")
                    .setFontSize(8)
                    .setFontColor(new DeviceRgb(156, 163, 175))
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(25));

            doc.add(new Paragraph("Documento generado el " + LocalDateTime.now().format(FMT))
                    .setFontSize(7)
                    .setFontColor(new DeviceRgb(156, 163, 175))
                    .setTextAlignment(TextAlignment.CENTER));

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar constancia PDF: " + e.getMessage(), e);
        }
    }

    // ── Helpers internos ──

    private void addHeader(Document doc, String codigoConstancia) {
        Paragraph title = new Paragraph("ECOTACNA")
                .setFontSize(28)
                .setBold()
                .setFontColor(ECO_GREEN)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(2);
        doc.add(title);

        Paragraph subtitle = new Paragraph("Constancia de Recojo y Pago")
                .setFontSize(16)
                .setBold()
                .setFontColor(ECO_DARK)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(4);
        doc.add(subtitle);

        Paragraph code = new Paragraph("Código: " + codigoConstancia)
                .setFontSize(10)
                .setFontColor(new DeviceRgb(107, 114, 128))
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(2);
        doc.add(code);

        Paragraph date = new Paragraph("Fecha de emisión: " + LocalDateTime.now().format(FMT))
                .setFontSize(10)
                .setFontColor(new DeviceRgb(107, 114, 128))
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(12);
        doc.add(date);

        // Línea separadora
        Table separator = new Table(UnitValue.createPercentArray(1)).useAllAvailableWidth();
        separator.addCell(new Cell().setBorder(Border.NO_BORDER)
                .setBorderBottom(new SolidBorder(ECO_GREEN, 2))
                .setHeight(1));
        doc.add(separator);
        doc.add(new Paragraph("").setMarginBottom(8));
    }

    private void addSectionTitle(Document doc, String title) {
        Paragraph p = new Paragraph(title)
                .setFontSize(11)
                .setBold()
                .setFontColor(ColorConstants.WHITE)
                .setBackgroundColor(TABLE_HEADER_BG)
                .setPadding(6)
                .setPaddingLeft(10)
                .setMarginBottom(0);
        doc.add(p);
    }

    private Table createDataTable() {
        Table table = new Table(UnitValue.createPercentArray(new float[]{35, 65}))
                .useAllAvailableWidth()
                .setMarginBottom(0);
        return table;
    }

    private void addDataRow(Table table, String label, String value) {
        Cell labelCell = new Cell()
                .add(new Paragraph(label).setFontSize(9).setBold().setFontColor(new DeviceRgb(55, 65, 81)))
                .setPadding(5)
                .setPaddingLeft(10)
                .setBackgroundColor(LIGHT_GRAY)
                .setBorder(new SolidBorder(new DeviceRgb(229, 231, 235), 0.5f));
        table.addCell(labelCell);

        Cell valueCell = new Cell()
                .add(new Paragraph(value != null ? value : "—").setFontSize(9).setFontColor(new DeviceRgb(17, 24, 39)))
                .setPadding(5)
                .setPaddingLeft(10)
                .setBorder(new SolidBorder(new DeviceRgb(229, 231, 235), 0.5f));
        table.addCell(valueCell);
    }

    private Table createPaymentSummaryTable(PickupRequest request) {
        Table table = new Table(UnitValue.createPercentArray(new float[]{40, 30, 30}))
                .useAllAvailableWidth();

        // Header
        String[] headers = {"Concepto", "Detalle", "Valor"};
        for (String h : headers) {
            table.addHeaderCell(new Cell()
                    .add(new Paragraph(h).setFontSize(9).setBold().setFontColor(ColorConstants.WHITE))
                    .setBackgroundColor(TABLE_HEADER_BG)
                    .setPadding(6)
                    .setTextAlignment(TextAlignment.CENTER));
        }

        // Litros
        addPaymentRow(table, "Litros confirmados",
                formatVolume(request.getLitrosConfirmados()),
                formatVolume(request.getLitrosConfirmados()));

        // Precio por litro
        addPaymentRow(table, "Precio por litro", "S/ por litro",
                "S/ " + (request.getPrecioPorLitro() != null ? request.getPrecioPorLitro().toPlainString() : "0.00"));

        // Monto total (fila destacada)
        Cell c1 = new Cell()
                .add(new Paragraph("MONTO TOTAL").setFontSize(10).setBold().setFontColor(ECO_DARK))
                .setBackgroundColor(LIGHT_GREEN_BG)
                .setPadding(8)
                .setBorder(new SolidBorder(new DeviceRgb(229, 231, 235), 0.5f));
        Cell c2 = new Cell()
                .add(new Paragraph("litros × precio").setFontSize(9).setFontColor(new DeviceRgb(107, 114, 128)))
                .setBackgroundColor(LIGHT_GREEN_BG)
                .setPadding(8)
                .setTextAlignment(TextAlignment.CENTER)
                .setBorder(new SolidBorder(new DeviceRgb(229, 231, 235), 0.5f));
        Cell c3 = new Cell()
                .add(new Paragraph("S/ " + (request.getMontoTotal() != null ? request.getMontoTotal().toPlainString() : "0.00"))
                        .setFontSize(12).setBold().setFontColor(ECO_GREEN))
                .setBackgroundColor(LIGHT_GREEN_BG)
                .setPadding(8)
                .setTextAlignment(TextAlignment.CENTER)
                .setBorder(new SolidBorder(new DeviceRgb(229, 231, 235), 0.5f));
        table.addCell(c1);
        table.addCell(c2);
        table.addCell(c3);

        // Estado de pago
        addPaymentRow(table, "Estado de pago", "", request.getEstadoPago() != null ? request.getEstadoPago() : "—");

        // Observación de pago
        if (request.getObservacionPago() != null && !request.getObservacionPago().isBlank()) {
            addPaymentRow(table, "Observación", "", request.getObservacionPago());
        }

        return table;
    }

    private void addPaymentRow(Table table, String concept, String detail, String value) {
        table.addCell(new Cell()
                .add(new Paragraph(concept).setFontSize(9).setFontColor(new DeviceRgb(55, 65, 81)))
                .setPadding(6).setPaddingLeft(10)
                .setBorder(new SolidBorder(new DeviceRgb(229, 231, 235), 0.5f)));
        table.addCell(new Cell()
                .add(new Paragraph(detail).setFontSize(9).setFontColor(new DeviceRgb(107, 114, 128)))
                .setPadding(6).setTextAlignment(TextAlignment.CENTER)
                .setBorder(new SolidBorder(new DeviceRgb(229, 231, 235), 0.5f)));
        table.addCell(new Cell()
                .add(new Paragraph(value).setFontSize(9).setBold().setFontColor(new DeviceRgb(17, 24, 39)))
                .setPadding(6).setTextAlignment(TextAlignment.CENTER)
                .setBorder(new SolidBorder(new DeviceRgb(229, 231, 235), 0.5f)));
    }

    private void addSpacer(Document doc) {
        doc.add(new Paragraph("").setMarginBottom(8));
    }

    private String formatDate(LocalDateTime dt) {
        if (dt == null) return "—";
        return dt.format(FMT);
    }

    private String formatVolume(BigDecimal vol) {
        if (vol == null) return "0.00 L";
        return vol.toPlainString() + " L";
    }
}
