package com.travelplanner.service;

import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.qrcode.QRCodeWriter;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.travelplanner.entity.Booking;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;

@Service
public class PdfTicketService {

    public byte[] generateTicketPdf(Booking booking) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(doc, out);
            doc.open();

            // Colors
            Color primaryTeal = new Color(20, 73, 94);
            Color darkGray = new Color(50, 50, 50);
            Color lightBg = new Color(245, 247, 250);

            // Fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22, primaryTeal);
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 11, Color.GRAY);
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, primaryTeal);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, darkGray);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, darkGray);
            Font codeFont = FontFactory.getFont(FontFactory.COURIER, 9, darkGray);

            // Header Table
            PdfPTable header = new PdfPTable(2);
            header.setWidthPercentage(100);
            header.setWidths(new float[]{70, 30});

            PdfPCell h1 = new PdfPCell();
            h1.setBorder(Rectangle.NO_BORDER);
            h1.addElement(new Paragraph("JOURNEY / E-TICKET", titleFont));
            h1.addElement(new Paragraph("Official Multi-Modal Travel Itinerary & Boarding Pass", subtitleFont));
            header.addCell(h1);

            // QR Code
            QRCodeWriter qrWriter = new QRCodeWriter();
            BitMatrix bitMatrix = qrWriter.encode(
                    "JOURNEY-TICKET|" + booking.getBookingRef() + "|" + booking.getPassengerName() + "|"
                            + booking.getOrigin() + "->" + booking.getDestination() + "|" + booking.getTotalFare(),
                    BarcodeFormat.QR_CODE, 100, 100);
            ByteArrayOutputStream qrOut = new ByteArrayOutputStream();
            MatrixToImageWriter.writeToStream(bitMatrix, "PNG", qrOut);
            Image qrImage = Image.getInstance(qrOut.toByteArray());
            qrImage.setAlignment(Element.ALIGN_RIGHT);

            PdfPCell h2 = new PdfPCell(qrImage);
            h2.setBorder(Rectangle.NO_BORDER);
            h2.setHorizontalAlignment(Element.ALIGN_RIGHT);
            header.addCell(h2);

            doc.add(header);
            doc.add(new Paragraph(" "));

            // Ticket Info Box Table
            PdfPTable infoTable = new PdfPTable(4);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{25, 25, 25, 25});

            addCell(infoTable, "BOOKING REF", booking.getBookingRef(), boldFont, normalFont, lightBg);
            addCell(infoTable, "STATUS", booking.getStatus(), boldFont, normalFont, lightBg);
            addCell(infoTable, "TRAVEL DATE", booking.getTravelDate().toString(), boldFont, normalFont, lightBg);
            addCell(infoTable, "TOTAL FARE", "₹ " + booking.getTotalFare(), boldFont, normalFont, lightBg);

            addCell(infoTable, "PASSENGER", booking.getPassengerName(), boldFont, normalFont, null);
            addCell(infoTable, "EMAIL", booking.getPassengerEmail(), boldFont, normalFont, null);
            addCell(infoTable, "FROM", booking.getOrigin(), boldFont, normalFont, null);
            addCell(infoTable, "TO", booking.getDestination(), boldFont, normalFont, null);

            addCell(infoTable, "DEPARTS", booking.getDepartureTime(), boldFont, normalFont, lightBg);
            addCell(infoTable, "ARRIVES", booking.getArrivalTime(), boldFont, normalFont, lightBg);
            addCell(infoTable, "DURATION", (booking.getDurationMin() / 60) + "h " + (booking.getDurationMin() % 60) + "m", boldFont, normalFont, lightBg);
            addCell(infoTable, "CO2 ESTIMATE", booking.getCo2Kg() + " kg", boldFont, normalFont, lightBg);

            doc.add(infoTable);
            doc.add(new Paragraph(" "));

            // Itinerary Section
            doc.add(new Paragraph("JOURNEY LEGS & ROUTE BREAKDOWN", sectionFont));
            doc.add(new Paragraph(" "));

            if (booking.getItineraryDetails() != null && !booking.getItineraryDetails().isBlank()) {
                Paragraph p = new Paragraph(booking.getItineraryDetails(), codeFont);
                PdfPTable itTable = new PdfPTable(1);
                itTable.setWidthPercentage(100);
                PdfPCell cell = new PdfPCell(p);
                cell.setBackgroundColor(lightBg);
                cell.setPadding(10);
                cell.setBorderColor(new Color(220, 224, 230));
                itTable.addCell(cell);
                doc.add(itTable);
            }

            doc.add(new Paragraph(" "));
            Paragraph footer = new Paragraph(
                    "IMPORTANT: Please carry a valid Government ID card. Reach stations/boarding points on time.\n"
                            + "Generated by Journey Multi-Modal Transit Engine  •  Verification: " + booking.getBookingRef(),
                    FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 8, Color.GRAY));
            footer.setAlignment(Element.ALIGN_CENTER);
            doc.add(footer);

            doc.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate PDF ticket: " + e.getMessage(), e);
        }
    }

    private void addCell(PdfPTable table, String header, String value, Font hFont, Font vFont, Color bg) {
        PdfPCell cell = new PdfPCell();
        if (bg != null) cell.setBackgroundColor(bg);
        cell.setPadding(6);
        cell.setBorderColor(new Color(220, 224, 230));
        cell.addElement(new Paragraph(header, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7, Color.GRAY)));
        cell.addElement(new Paragraph(value, vFont));
        table.addCell(cell);
    }
}
