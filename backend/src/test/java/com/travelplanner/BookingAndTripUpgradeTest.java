package com.travelplanner;

import com.travelplanner.dto.BookingDto;
import com.travelplanner.dto.BookingRequest;
import com.travelplanner.dto.RefundPreviewDto;
import com.travelplanner.dto.TripStatusDto;
import com.travelplanner.engine.service.FareCalendar;
import com.travelplanner.engine.service.RefundPolicy;
import com.travelplanner.entity.Booking;
import com.travelplanner.entity.Role;
import com.travelplanner.entity.User;
import com.travelplanner.repository.BookingRepository;
import com.travelplanner.service.BookingService;
import com.travelplanner.service.TravelRouteService;
import com.travelplanner.service.payment.MockPaymentGateway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class BookingAndTripUpgradeTest {

    private TravelRouteService routeService;
    private BookingRepository bookingRepository;
    private MockPaymentGateway paymentGateway;
    private BookingService bookingService;
    private User testUser;

    @BeforeEach
    void setUp() {
        routeService = new TravelRouteService();
        routeService.init();

        bookingRepository = Mockito.mock(BookingRepository.class);
        paymentGateway = new MockPaymentGateway();
        bookingService = new BookingService(bookingRepository, routeService, paymentGateway);

        testUser = new User();
        testUser.setId(101L);
        testUser.setName("Test Traveler");
        testUser.setEmail("traveler@journey.com");
        testUser.setRole(Role.ROLE_TRAVELER);

        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            if (b.getId() == null) b.setId(1L);
            return b;
        });
    }

    @Test
    void testTamperedFareIsIgnoredByServer() {
        BookingRequest req = new BookingRequest();
        req.setOrigin("Nanded");
        req.setDestination("Prayagraj");
        req.setTravelDate("2026-11-21");
        req.setPassengers(2);
        req.setLegIds(List.of("AX006")); // Direct Nanded-Prayagraj base fare 1390
        req.setTotalFare(10); // Tampered fare sent by devtools

        BookingDto result = bookingService.createBooking(req, testUser);

        assertNotNull(result);
        assertNotEquals(10, result.getTotalFare(), "Server MUST NOT trust client totalFare!");
        assertTrue(result.getTotalFare() >= 2780, "Fare should be unit fare * 2 passengers");
        assertEquals("CONFIRMED", result.getStatus());
        assertEquals("PAID", result.getPaymentStatus());
    }

    @Test
    void testPaymentFailureRejection() {
        BookingRequest req = new BookingRequest();
        req.setOrigin("Nanded");
        req.setDestination("Prayagraj");
        req.setTravelDate("2026-11-21");
        req.setLegIds(List.of("AX006"));
        req.setPaymentMethod("CARD");
        req.setPaymentDetails("4111111111110000"); // ends in 0000 -> Demo rule fails

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> {
            bookingService.createBooking(req, testUser);
        });

        assertTrue(ex.getMessage().contains("Decline") || ex.getMessage().contains("failed"));
    }

    @Test
    void testRefundPolicyBoundaries() {
        assertEquals(90, RefundPolicy.refundPercent(50));
        assertEquals(90, RefundPolicy.refundPercent(48));
        assertEquals(75, RefundPolicy.refundPercent(47));
        assertEquals(75, RefundPolicy.refundPercent(24));
        assertEquals(50, RefundPolicy.refundPercent(23));
        assertEquals(50, RefundPolicy.refundPercent(6));
        assertEquals(0, RefundPolicy.refundPercent(5));
        assertEquals(0, RefundPolicy.refundPercent(0));
        assertEquals(0, RefundPolicy.refundPercent(-2));

        assertEquals(900, RefundPolicy.refundAmount(1000, 50));
        assertEquals(750, RefundPolicy.refundAmount(1000, 30));
        assertEquals(500, RefundPolicy.refundAmount(1000, 10));
        assertEquals(0, RefundPolicy.refundAmount(1000, 2));
    }

    @Test
    void testTripStatusCancellationAndAlternatives() {
        // Book a 2-leg trip
        Booking b = new Booking();
        b.setId(42L);
        b.setBookingRef("JNY-TEST");
        b.setUser(testUser);
        b.setTravelDate(LocalDate.parse("2026-11-21"));
        b.setDepartureTime("2026-11-21 06:00");
        b.setPlannedLegs("B001|Nanded|Nagpur|360|750\nT_NGP_PRY_1|Nagpur|Prayagraj|810|1390\n");
        b.setTotalFare(1300);

        when(bookingRepository.findById(42L)).thenReturn(Optional.of(b));

        // Normal check: should be on time
        TripStatusDto status1 = bookingService.getTripStatus(42L, testUser);
        assertEquals("ON_TIME", status1.getOverallState());
        assertTrue(status1.getAlternatives().isEmpty());

        // Now cancel first leg: B001
        routeService.getDisruptions().cancel("B001", "Severe fog warning");

        TripStatusDto status2 = bookingService.getTripStatus(42L, testUser);
        assertEquals("CANCELLED", status2.getOverallState());
        assertTrue(status2.getHeadline().contains("cancelled"));
        assertFalse(status2.getAlternatives().isEmpty(), "Must propose alternatives when a leg is cancelled");

        // Clean up
        routeService.getDisruptions().reset();
    }

    @Test
    void testWhereIsMyTrainLiveTracking() {
        com.travelplanner.service.LiveTrackingService trackingService =
                new com.travelplanner.service.LiveTrackingService(routeService);

        // 1. In-transit simulation at 50%
        com.travelplanner.dto.LiveTrainStatusDto status = trackingService.getLiveStatus("T_MMR_NGP_1", 0.5);
        assertNotNull(status);
        assertEquals("Manmad", status.getOrigin());
        assertEquals("Nagpur", status.getDestination());
        assertEquals("ON_TIME", status.getOverallStatus());
        assertTrue(status.getCurrentSpeedKmh() > 0);
        assertEquals(50.0, status.getProgressPercent(), 0.1);
        assertNotNull(status.getNextStation());
        assertNotNull(status.getPreviousStation());
        assertFalse(status.getStations().isEmpty());

        // 2. Disruption delay integration
        routeService.getDisruptions().addDelay("T_MMR_NGP_1", 35, "Signal issue at Bhusawal");
        com.travelplanner.dto.LiveTrainStatusDto delayedStatus = trackingService.getLiveStatus("T_MMR_NGP_1", 0.5);
        assertEquals("DELAYED", delayedStatus.getOverallStatus());
        assertEquals(35, delayedStatus.getDelayMinutes());
        assertTrue(delayedStatus.getStations().get(delayedStatus.getStations().size() - 1).getDelayMinutes() == 35);

        // Clean up
        routeService.getDisruptions().reset();
    }
}
