package com.travelplanner.engine.service;

import com.travelplanner.engine.model.DepartureWindow;
import com.travelplanner.engine.model.Mode;
import com.travelplanner.engine.model.Route;
import com.travelplanner.engine.model.ScheduledLeg;
import java.time.LocalDate;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;

/**
 * Re-validates a route on the SERVER at booking time. The browser sends only the leg ids it chose;
 * the server rebuilds the itinerary and the price itself, so a tampered fare or an already-cancelled
 * service can never be booked.
 */
public final class RouteResolver {
    private RouteResolver() { }

    public static Optional<Route> resolve(RouteFinder finder, String origin, String destination,
                                          LocalDate date, List<String> legIds) {
        if (legIds == null || legIds.isEmpty()) return Optional.empty();
        List<Route> candidates = finder.findAll(origin, destination, date, legIds.size(),
                EnumSet.allOf(Mode.class), DepartureWindow.ANY);
        for (Route r : candidates) {
            if (r.getLegs().size() != legIds.size()) continue;
            boolean same = true;
            for (int i = 0; i < legIds.size(); i++) {
                ScheduledLeg sl = r.getLegs().get(i);
                if (!sl.getLeg().getId().equals(legIds.get(i))) { same = false; break; }
            }
            if (same) return Optional.of(r);
        }
        return Optional.empty();   // not runnable that day, cancelled, or ids invented
    }
}
