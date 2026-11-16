package com.travelplanner.controller;

import com.travelplanner.dto.BookingDto;
import com.travelplanner.dto.DisruptionRequest;
import com.travelplanner.engine.model.Leg;
import com.travelplanner.entity.User;
import com.travelplanner.repository.BookingRepository;
import com.travelplanner.repository.UserRepository;
import com.travelplanner.service.BookingService;
import com.travelplanner.service.TravelRouteService;
import com.travelplanner.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final TravelRouteService routeService;
    private final BookingService bookingService;
    private final UserService userService;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    public AdminController(TravelRouteService routeService, BookingService bookingService,
                           UserService userService, BookingRepository bookingRepository, UserRepository userRepository) {
        this.routeService = routeService;
        this.bookingService = bookingService;
        this.userService = userService;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/legs")
    public ResponseEntity<List<Map<String, Object>>> getAllLegs() {
        var d = routeService.getDisruptions();
        List<Map<String, Object>> legs = routeService.getAllLegs().stream().map(leg -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", leg.getId());
            m.put("operator", leg.getOperator());
            m.put("name", leg.getName());
            m.put("mode", leg.getMode().name());
            m.put("category", leg.getCategory());
            m.put("from", leg.getFrom());
            m.put("to", leg.getTo());
            m.put("departureMin", leg.getDepartureMin());
            m.put("durationMin", leg.getDurationMin());
            m.put("fare", leg.getFare());
            m.put("isCancelled", d.isCancelled(leg.getId()));
            m.put("delayMin", d.getDelay(leg.getId()));
            return m;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(legs);
    }

    @PostMapping("/disruptions")
    public ResponseEntity<Map<String, Object>> handleDisruption(@RequestBody DisruptionRequest req) {
        var d = routeService.getDisruptions();
        String action = req.getAction() != null ? req.getAction().toUpperCase() : "";

        switch (action) {
            case "CANCEL":
                d.cancel(req.getLegId(), req.getDescription() != null ? req.getDescription() : "Manual admin cancellation");
                break;
            case "DELAY":
                d.addDelay(req.getLegId(), req.getDelayMinutes() > 0 ? req.getDelayMinutes() : 60,
                        req.getDescription() != null ? req.getDescription() : "Operational delay");
                break;
            case "RESTORE":
            case "RESET":
                d.reset();
                break;
            default:
                throw new IllegalArgumentException("Unknown disruption action: " + action);
        }

        return ResponseEntity.ok(Map.of(
                "message", "Disruption updated successfully",
                "cancelledCount", d.getCancelledCount(),
                "delayedCount", d.getTotalDelayedCount()
        ));
    }

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingDto>> getAllBookings() {
        return ResponseEntity.ok(bookingService.getAllBookingsAdmin());
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long totalBookings = bookingRepository.count();
        long totalUsers = userRepository.count();
        var bookings = bookingRepository.findAll();
        int totalRevenue = bookings.stream().mapToInt(b -> b.getTotalFare()).sum();
        var d = routeService.getDisruptions();

        return ResponseEntity.ok(Map.of(
                "totalBookings", totalBookings,
                "totalUsers", totalUsers,
                "totalRevenue", totalRevenue,
                "activeCancellations", d.getCancelledCount(),
                "activeDelays", d.getTotalDelayedCount()
        ));
    }
}
