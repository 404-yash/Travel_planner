package com.travelplanner.service;

import com.travelplanner.dto.BookingDto;
import com.travelplanner.dto.BookingRequest;
import com.travelplanner.dto.RefundPreviewDto;
import com.travelplanner.dto.RouteDto;
import com.travelplanner.dto.TripStatusDto;
import com.travelplanner.engine.model.Leg;
import com.travelplanner.engine.model.Route;
import com.travelplanner.engine.model.ScheduledLeg;
import com.travelplanner.engine.service.RefundPolicy;
import com.travelplanner.engine.service.TripMonitor;
import com.travelplanner.engine.util.TimeFormat;
import com.travelplanner.entity.Booking;
import com.travelplanner.entity.Role;
import com.travelplanner.entity.User;
import com.travelplanner.repository.BookingRepository;
import com.travelplanner.service.payment.PaymentGateway;
import com.travelplanner.service.payment.PaymentResult;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TravelRouteService routeService;
    private final PaymentGateway paymentGateway;
    private final SecureRandom random = new SecureRandom();

    public BookingService(BookingRepository bookingRepository,
                          TravelRouteService routeService,
                          PaymentGateway paymentGateway) {
        this.bookingRepository = bookingRepository;
        this.routeService = routeService;
        this.paymentGateway = paymentGateway;
    }

    public BookingDto createBooking(BookingRequest req, User user) {
        if (req.getOrigin() == null || req.getDestination() == null) {
            throw new IllegalArgumentException("Origin and Destination are required");
        }
        if (req.getTravelDate() == null || req.getTravelDate().isBlank()) {
            throw new IllegalArgumentException("Travel date is required");
        }

        LocalDate date = LocalDate.parse(req.getTravelDate());
        int pax = Math.min(Math.max(req.getPassengers(), 1), 9);

        // Server resolves and validates route — Never trust client fare/itinerary
        Route route;
        if (req.getLegIds() != null && !req.getLegIds().isEmpty()) {
            route = routeService.resolve(req.getOrigin(), req.getDestination(), date, req.getLegIds())
                    .orElseThrow(() -> new IllegalArgumentException("This journey is no longer available. Please search again."));
        } else {
            // Fallback for direct searches or legacy calls
            List<RouteDto> searchResults = routeService.search(
                    new com.travelplanner.dto.RouteSearchRequest() {{
                        setOrigin(req.getOrigin());
                        setDestination(req.getDestination());
                        setDate(req.getTravelDate());
                    }}
            );
            if (searchResults.isEmpty()) {
                throw new IllegalArgumentException("No available routes found for this itinerary.");
            }
            // Resolve from the first result's legs
            List<String> firstLegIds = searchResults.get(0).getLegs().stream().map(l -> l.getId()).toList();
            route = routeService.resolve(req.getOrigin(), req.getDestination(), date, firstLegIds)
                    .orElseThrow(() -> new IllegalArgumentException("Journey validation failed."));
        }

        // Server calculates the exact fare
        int unitFare = routeService.calculateRouteFare(route, date);
        int totalFare = unitFare * pax;

        // Process demo payment
        String method = req.getPaymentMethod() != null ? req.getPaymentMethod() : "DEMO_UPI";
        PaymentResult payResult = paymentGateway.charge(method, totalFare, user.getEmail(), req.getPaymentDetails());
        if (!payResult.isSuccess()) {
            throw new IllegalStateException(payResult.getMessage());
        }

        // Format dates
        String depTime = formatDateTime(date, route.getDepartureAbs());
        String arrTime = formatDateTime(date, route.getArrivalAbs());

        Booking booking = new Booking();
        booking.setBookingRef(generateRef());
        booking.setUser(user);
        booking.setPassengerName(req.getPassengerName() != null && !req.getPassengerName().isBlank() ? req.getPassengerName() : user.getName());
        booking.setPassengerEmail(req.getPassengerEmail() != null && !req.getPassengerEmail().isBlank() ? req.getPassengerEmail() : user.getEmail());
        booking.setContactPhone(req.getContactPhone());
        booking.setOrigin(route.getOrigin());
        booking.setDestination(route.getDestination());
        booking.setTravelDate(date);
        booking.setDepartureTime(depTime);
        booking.setArrivalTime(arrTime);
        booking.setDurationMin(route.getTotalDurationMin());
        booking.setTransfers(route.getTransfers());
        booking.setTotalFare(totalFare);
        booking.setPassengers(pax);
        booking.setCo2Kg(Math.round(route.getEstimatedCO2Kg() * pax * 10.0) / 10.0);
        booking.setModeSummary(route.getModeSummary());
        booking.setStatus("CONFIRMED");
        booking.setPaymentRef(payResult.getTransactionRef());
        booking.setPaymentStatus("PAID");

        // Serialize planned legs: legId|from|to|depAbs|arrAbs
        StringBuilder plannedSb = new StringBuilder();
        StringBuilder itinerarySb = new StringBuilder();
        for (int i = 0; i < route.getLegs().size(); i++) {
            ScheduledLeg sl = route.getLegs().get(i);
            Leg leg = sl.getLeg();
            plannedSb.append(leg.getId()).append("|")
                     .append(leg.getFrom()).append("|")
                     .append(leg.getTo()).append("|")
                     .append(sl.getDepartureAbs()).append("|")
                     .append(sl.getArrivalAbs()).append("\n");

            itinerarySb.append(leg.getMode()).append(": ").append(leg.getFrom()).append(" -> ").append(leg.getTo())
                       .append(" (").append(leg.getName()).append(")\n");
        }
        booking.setPlannedLegs(plannedSb.toString());
        booking.setItineraryDetails(itinerarySb.toString());

        Booking saved = bookingRepository.save(booking);
        return toDto(saved);
    }

    public List<BookingDto> getUserBookings(User user) {
        // Fix B4: regular user bookings page only returns user's bookings, never all
        return bookingRepository.findByUserOrderByBookedAtDesc(user).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<BookingDto> getAllBookingsAdmin() {
        return bookingRepository.findAll().stream()
                .sorted(Comparator.comparing(Booking::getBookedAt).reversed())
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Booking getOwned(Long id, User user) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));
        if (!booking.getUser().getId().equals(user.getId()) && user.getRole() != Role.ROLE_ADMIN) {
            throw new SecurityException("Not authorized to view or modify this booking");
        }
        return booking;
    }

    public RefundPreviewDto refundPreview(Long id, User user) {
        Booking b = getOwned(id, user);
        if ("CANCELLED".equalsIgnoreCase(b.getStatus())) {
            return new RefundPreviewDto(0, 0, "Booking is already cancelled.", false);
        }

        long hoursBefore = calculateHoursBeforeDeparture(b);
        if (hoursBefore < 0) {
            return new RefundPreviewDto(0, 0, "Trip has already departed. No refund eligible.", false);
        }

        int pct = RefundPolicy.refundPercent(hoursBefore);
        int amount = RefundPolicy.refundAmount(b.getTotalFare(), hoursBefore);
        String desc = RefundPolicy.describe(hoursBefore);
        return new RefundPreviewDto(pct, amount, desc, true);
    }

    public BookingDto cancelBooking(Long id, User user) {
        Booking booking = getOwned(id, user);

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalStateException("Booking is already cancelled.");
        }

        long hoursBefore = calculateHoursBeforeDeparture(booking);
        if (hoursBefore < 0) {
            throw new IllegalStateException("Trip has already departed; cancellation not permitted.");
        }

        int refund = RefundPolicy.refundAmount(booking.getTotalFare(), hoursBefore);
        booking.setStatus("CANCELLED");
        booking.setRefundAmount(refund);
        booking.setPaymentStatus("REFUNDED_₹" + refund);

        return toDto(bookingRepository.save(booking));
    }

    public TripStatusDto getTripStatus(Long id, User user) {
        Booking b = getOwned(id, user);
        List<TripMonitor.PlannedLeg> planned = parsePlannedLegs(b.getPlannedLegs());
        TripMonitor.Report report = routeService.monitor(planned, b.getTravelDate());

        TripStatusDto statusDto = new TripStatusDto();
        statusDto.setBookingId(b.getId());
        statusDto.setHeadline(report.headline);
        statusDto.setDepartureTime(b.getDepartureTime());

        int firstDepAbs = planned.isEmpty() ? 0 : planned.get(0).departureAbs;
        statusDto.setFirstLegDepAbsMin(firstDepAbs);

        int totalDelay = 0;
        boolean hasCancelled = false;
        boolean hasDelayed = false;

        Map<String, Leg> legMap = routeService.getAllLegs().stream()
                .collect(Collectors.toMap(Leg::getId, l -> l, (a, b2) -> a));

        List<TripStatusDto.LegStatusItem> legItems = new ArrayList<>();
        for (int i = 0; i < planned.size(); i++) {
            TripMonitor.PlannedLeg p = planned.get(i);
            TripStatusDto.LegStatusItem item = new TripStatusDto.LegStatusItem();
            item.setLegId(p.legId);
            item.setFrom(p.from);
            item.setTo(p.to);
            item.setDepartureTime(formatDateTime(b.getTravelDate(), p.departureAbs));
            item.setArrivalTime(formatDateTime(b.getTravelDate(), p.arrivalAbs));

            Leg leg = legMap.get(p.legId);
            if (leg != null) {
                item.setMode(leg.getMode().name());
                item.setName(leg.getName());
                item.setOperator(leg.getOperator());
                item.setBoardingBufferMin(leg.getBoardingBufferMinutes());
            }

            if (routeService.getDisruptions().isCancelled(p.legId)) {
                item.setState("CANCELLED");
                hasCancelled = true;
            } else if (routeService.getDisruptions().getDelay(p.legId) > 0) {
                int d = routeService.getDisruptions().getDelay(p.legId);
                item.setState("DELAYED");
                item.setDelayMinutes(d);
                totalDelay += d;
                hasDelayed = true;
            } else {
                item.setState("ON_TIME");
            }
            legItems.add(item);
        }

        statusDto.setLegs(legItems);
        statusDto.setTotalDelayMinutes(totalDelay);
        statusDto.setOverallState(hasCancelled ? "CANCELLED" : (hasDelayed ? "DELAYED" : "ON_TIME"));

        // Map alternatives
        List<RouteDto> altDtos = new ArrayList<>();
        for (Route alt : report.alternatives) {
            altDtos.add(routeService.toRouteDto(alt, b.getTravelDate()));
        }
        statusDto.setAlternatives(altDtos);

        return statusDto;
    }

    public BookingDto rebook(Long oldBookingId, List<String> legIds, String origin, String destination, User user) {
        Booking oldBooking = getOwned(oldBookingId, user);

        // Mark old booking as CHANGED
        oldBooking.setStatus("CHANGED");
        oldBooking.setRefundAmount(oldBooking.getTotalFare());
        bookingRepository.save(oldBooking);

        // Create new replacement booking
        BookingRequest newReq = new BookingRequest();
        newReq.setOrigin(origin != null ? origin : oldBooking.getOrigin());
        newReq.setDestination(destination != null ? destination : oldBooking.getDestination());
        newReq.setTravelDate(oldBooking.getTravelDate().toString());
        newReq.setPassengers(oldBooking.getPassengers());
        newReq.setPassengerName(oldBooking.getPassengerName());
        newReq.setPassengerEmail(oldBooking.getPassengerEmail());
        newReq.setLegIds(legIds);
        newReq.setPaymentMethod("ACCOUNT_CREDIT_REBOOK");

        return createBooking(newReq, user);
    }

    public Booking getBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + id));
    }

    private List<TripMonitor.PlannedLeg> parsePlannedLegs(String text) {
        List<TripMonitor.PlannedLeg> list = new ArrayList<>();
        if (text == null || text.isBlank()) return list;
        for (String line : text.split("\n")) {
            line = line.trim();
            if (line.isEmpty()) continue;
            String[] parts = line.split("\\|");
            if (parts.length >= 5) {
                try {
                    list.add(new TripMonitor.PlannedLeg(
                            parts[0], parts[1], parts[2],
                            Integer.parseInt(parts[3]), Integer.parseInt(parts[4])
                    ));
                } catch (Exception ignored) {}
            }
        }
        return list;
    }

    private long calculateHoursBeforeDeparture(Booking b) {
        try {
            String depStr = b.getDepartureTime();
            String[] parts = depStr.split(" ");
            LocalDate date = LocalDate.parse(parts[0]);
            String[] timeParts = parts[1].split(":");
            LocalDateTime depTime = date.atTime(Integer.parseInt(timeParts[0]), Integer.parseInt(timeParts[1]));
            return ChronoUnit.HOURS.between(LocalDateTime.now(), depTime);
        } catch (Exception e) {
            return 48; // safe fallback
        }
    }

    private String generateRef() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        StringBuilder sb = new StringBuilder("JNY-");
        for (int i = 0; i < 6; i++) {
            sb.append(chars.charAt(random.nextInt(chars.length())));
        }
        return sb.toString();
    }

    private String formatDateTime(LocalDate base, int absMin) {
        int days = absMin / 1440;
        int min = absMin % 1440;
        LocalDate d = base.plusDays(days);
        return d.toString() + " " + TimeFormat.clock(min);
    }

    private BookingDto toDto(Booking b) {
        BookingDto dto = new BookingDto();
        dto.setId(b.getId());
        dto.setBookingRef(b.getBookingRef());
        dto.setPassengerName(b.getPassengerName());
        dto.setPassengerEmail(b.getPassengerEmail());
        dto.setOrigin(b.getOrigin());
        dto.setDestination(b.getDestination());
        dto.setTravelDate(b.getTravelDate());
        dto.setDepartureTime(b.getDepartureTime());
        dto.setArrivalTime(b.getArrivalTime());
        dto.setDurationMin(b.getDurationMin());
        dto.setTransfers(b.getTransfers());
        dto.setTotalFare(b.getTotalFare());
        dto.setCo2Kg(b.getCo2Kg());
        dto.setModeSummary(b.getModeSummary());
        dto.setItineraryDetails(b.getItineraryDetails());
        dto.setStatus(b.getStatus());
        dto.setBookedAt(b.getBookedAt());
        dto.setPassengers(b.getPassengers());
        dto.setPaymentStatus(b.getPaymentStatus());
        dto.setPaymentRef(b.getPaymentRef());
        dto.setRefundAmount(b.getRefundAmount());
        dto.setContactPhone(b.getContactPhone());

        List<TripMonitor.PlannedLeg> planned = parsePlannedLegs(b.getPlannedLegs());
        dto.setLegIds(planned.stream().map(p -> p.legId).collect(Collectors.toList()));

        return dto;
    }
}
