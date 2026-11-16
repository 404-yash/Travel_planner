package com.travelplanner.controller;

import com.travelplanner.dto.RouteDto;
import com.travelplanner.dto.RouteSearchRequest;
import com.travelplanner.engine.service.FareCalendar;
import com.travelplanner.service.TravelRouteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/routes")
public class RouteController {

    private final TravelRouteService routeService;

    public RouteController(TravelRouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping("/cities")
    public ResponseEntity<List<String>> getCities() {
        return ResponseEntity.ok(routeService.getCities());
    }

    @GetMapping("/coordinates")
    public ResponseEntity<Map<String, double[]>> getCoordinates() {
        return ResponseEntity.ok(routeService.getCoordinates());
    }

    @PostMapping("/search")
    public ResponseEntity<List<RouteDto>> searchRoutes(@RequestBody RouteSearchRequest req) {
        return ResponseEntity.ok(routeService.search(req));
    }

    @GetMapping("/fare-calendar")
    public ResponseEntity<List<FareCalendar.DayFare>> getFareCalendar(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(required = false) String start,
            @RequestParam(defaultValue = "7") int days) {
        LocalDate startDate = start != null && !start.isBlank() ? LocalDate.parse(start) : LocalDate.now();
        return ResponseEntity.ok(routeService.fareCalendar(from, to, startDate, days));
    }

    @GetMapping("/disruptions")
    public ResponseEntity<Map<String, Object>> getDisruptions() {
        var d = routeService.getDisruptions();
        return ResponseEntity.ok(Map.of(
                "cancelledCount", d.getCancelledCount(),
                "delayedCount", d.getTotalDelayedCount()
        ));
    }
}
