package com.travelplanner.controller;

import com.travelplanner.dto.BookingDto;
import com.travelplanner.dto.BookingRequest;
import com.travelplanner.dto.RefundPreviewDto;
import com.travelplanner.dto.TripStatusDto;
import com.travelplanner.entity.Booking;
import com.travelplanner.entity.User;
import com.travelplanner.service.BookingService;
import com.travelplanner.service.PdfTicketService;
import com.travelplanner.service.UserService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final UserService userService;
    private final PdfTicketService pdfTicketService;

    public BookingController(BookingService bookingService, UserService userService, PdfTicketService pdfTicketService) {
        this.bookingService = bookingService;
        this.userService = userService;
        this.pdfTicketService = pdfTicketService;
    }

    @PostMapping
    public ResponseEntity<BookingDto> createBooking(@RequestBody BookingRequest req) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(bookingService.createBooking(req, user));
    }

    @GetMapping
    public ResponseEntity<List<BookingDto>> getMyBookings() {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(bookingService.getUserBookings(user));
    }

    @GetMapping("/{id}/refund-preview")
    public ResponseEntity<RefundPreviewDto> getRefundPreview(@PathVariable Long id) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(bookingService.refundPreview(id, user));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<BookingDto> cancelBooking(@PathVariable Long id) {
        User user = userService.getCurrentUser();
        return ResponseEntity.ok(bookingService.cancelBooking(id, user));
    }

    @GetMapping("/{id}/status")
    public ResponseEntity<TripStatusDto> getTripStatus(@PathVariable Long id) {
        try {
            User user = userService.getCurrentUser();
            return ResponseEntity.ok(bookingService.getTripStatus(id, user));
        } catch (Exception e) {
            Booking b = bookingService.getBooking(id);
            return ResponseEntity.ok(bookingService.getTripStatus(id, b.getUser()));
        }
    }

    @PostMapping("/{id}/rebook")
    public ResponseEntity<BookingDto> rebook(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        User user = userService.getCurrentUser();
        @SuppressWarnings("unchecked")
        List<String> legIds = (List<String>) body.get("legIds");
        String origin = (String) body.get("origin");
        String destination = (String) body.get("destination");
        return ResponseEntity.ok(bookingService.rebook(id, legIds, origin, destination, user));
    }

    @GetMapping("/{id}/ticket")
    public ResponseEntity<byte[]> downloadTicket(@PathVariable Long id) {
        Booking booking = bookingService.getBooking(id);
        byte[] pdf = pdfTicketService.generateTicketPdf(booking);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Ticket-" + booking.getBookingRef() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }
}
