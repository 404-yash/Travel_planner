package com.travelplanner;

import com.travelplanner.dto.RouteDto;
import com.travelplanner.dto.RouteSearchRequest;
import com.travelplanner.service.TravelRouteService;
import java.util.List;

public class DirectSearchTest {
    public static void main(String[] args) {
        TravelRouteService service = new TravelRouteService();
        service.init();

        RouteSearchRequest req = new RouteSearchRequest();
        req.setOrigin("Nanded");
        req.setDestination("Prayagraj");
        req.setDate("2026-11-21");
        req.setStrategy("CHEAPEST");
        req.setMaxLegs(4);

        List<RouteDto> routes = service.search(req);
        System.out.println("FOUND " + routes.size() + " ROUTES from " + req.getOrigin() + " to " + req.getDestination());
        for (RouteDto r : routes) {
            System.out.println(r.getOrigin() + " -> " + r.getDestination() + " | " + r.getModeSummary() + " | " + r.getTotalFare());
        }
    }
}
