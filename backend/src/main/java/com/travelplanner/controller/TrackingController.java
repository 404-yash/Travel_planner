package com.travelplanner.controller;

import com.travelplanner.dto.LiveTrainStatusDto;
import com.travelplanner.entity.Booking;
import com.travelplanner.entity.User;
import com.travelplanner.service.BookingService;
import com.travelplanner.service.LiveTrackingService;
import com.travelplanner.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tracking")
public class TrackingController {

    private final LiveTrackingService trackingService;
    private final BookingService bookingService;
    private final UserService userService;

    public TrackingController(LiveTrackingService trackingService,
                              BookingService bookingService,
                              UserService userService) {
        this.trackingService = trackingService;
        this.bookingService = bookingService;
        this.userService = userService;
    }

    @GetMapping("/service/{serviceId}")
    public ResponseEntity<LiveTrainStatusDto> getServiceStatus(
            @PathVariable String serviceId,
            @RequestParam(required = false) Double progress) {
        return ResponseEntity.ok(trackingService.getLiveStatus(serviceId, progress));
    }

    @GetMapping("/services")
    public ResponseEntity<List<Map<String, Object>>> getTrackableServices() {
        return ResponseEntity.ok(trackingService.getActiveServices());
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<LiveTrainStatusDto> getBookingTripTracking(
            @PathVariable Long bookingId,
            @RequestParam(defaultValue = "0") int legIndex,
            @RequestParam(required = false) Double progress) {
        Booking booking;
        try {
            User user = userService.getCurrentUser();
            booking = bookingService.getOwned(bookingId, user);
        } catch (Exception e) {
            booking = bookingService.getBooking(bookingId);
        }

        String planned = booking.getPlannedLegs();
        String legId = "12139";
        if (planned != null && !planned.isBlank()) {
            String[] lines = planned.trim().split("\n");
            int index = Math.min(Math.max(0, legIndex), lines.length - 1);
            legId = lines[index].split("\\|")[0];
        }

        return ResponseEntity.ok(trackingService.getLiveStatus(legId, progress));
    }
}
