package com.travelplanner.engine.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import com.travelplanner.engine.model.DepartureWindow;
import com.travelplanner.engine.model.Leg;
import com.travelplanner.engine.model.Mode;
import com.travelplanner.engine.model.Route;
import com.travelplanner.engine.model.ScheduledLeg;

/**
 * Finds EVERY feasible combination of legs (depth-first search over the city graph) so the user
 * sees several options, not just one shortest path. Respects running days, boarding buffers,
 * cancellations, delays, allowed modes and departure windows.
 */
public class RouteFinder {
    private static final int MAX_WAIT_MIN = 15 * 60;
    private static final int MAX_TOTAL_MIN = 60 * 60;

    private final Map<String, List<Leg>> legsByOrigin = new HashMap<>();
    // per-thread, so concurrent web requests cannot overwrite each other's value
    private final ThreadLocal<Integer> notBefore = ThreadLocal.withInitial(() -> 0);
    private final DisruptionRegistry disruptions;

    public RouteFinder(List<Leg> legs, DisruptionRegistry disruptions) {
        this.disruptions = disruptions;
        for (Leg leg : legs) {
            legsByOrigin.computeIfAbsent(leg.getFrom(), k -> new ArrayList<>()).add(leg);
        }
    }

    public List<Route> findAll(String origin, String destination, LocalDate startDate,
                               int maxLegs, EnumSet<Mode> allowedModes, DepartureWindow window) {
        return findAll(origin, destination, startDate, maxLegs, allowedModes, window, 0);
    }

    /**
     * Same search, but the first leg may not depart before 'notBeforeMin' (minutes since midnight of
     * startDate; may exceed 1440). Used to re-plan a trip that is already under way.
     */
    public List<Route> findAll(String origin, String destination, LocalDate startDate,
                               int maxLegs, EnumSet<Mode> allowedModes, DepartureWindow window,
                               int notBeforeMin) {
        this.notBefore.set(notBeforeMin);
        List<Route> found = new ArrayList<>();
        Set<String> visited = new HashSet<>();
        visited.add(origin);
        search(origin, destination, startDate, maxLegs, allowedModes, window,
               visited, new ArrayList<ScheduledLeg>(), found);
        return found;
    }

    private void search(String city, String destination, LocalDate startDate, int maxLegs,
                        EnumSet<Mode> allowedModes, DepartureWindow window,
                        Set<String> visited, List<ScheduledLeg> path, List<Route> out) {
        if (path.size() >= maxLegs) return;
        List<Leg> options = legsByOrigin.get(city);
        if (options == null) return;
        for (Leg leg : options) {
            if (disruptions.isCancelled(leg.getId()) || visited.contains(leg.getTo())) continue;
            if (!allowedModes.contains(leg.getMode())) continue;
            ScheduledLeg scheduled = schedule(leg, path, startDate);
            if (scheduled == null) continue;
            // Departure window filter: only applies to the first leg
            if (path.isEmpty() && window != DepartureWindow.ANY) {
                int minuteOfDay = scheduled.getDepartureAbs() % 1440;
                if (!window.contains(minuteOfDay)) continue;
            }
            int firstDeparture = path.isEmpty() ? scheduled.getDepartureAbs() : path.get(0).getDepartureAbs();
            if (scheduled.getArrivalAbs() - firstDeparture > MAX_TOTAL_MIN) continue;
            path.add(scheduled);
            if (leg.getTo().equals(destination)) {
                out.add(new Route(path));
            } else {
                visited.add(leg.getTo());
                search(leg.getTo(), destination, startDate, maxLegs, allowedModes, window,
                       visited, path, out);
                visited.remove(leg.getTo());
            }
            path.remove(path.size() - 1);
        }
    }

    /** Returns the earliest feasible departure of 'leg' after the previous leg, or null if none is reasonable. */
    private ScheduledLeg schedule(Leg leg, List<ScheduledLeg> path, LocalDate startDate) {
        int delay = disruptions.getDelay(leg.getId());
        if (path.isEmpty()) {
            int floor = notBefore.get();
            if (floor <= 0) {
                if (!leg.runsOn(startDate.getDayOfWeek())) return null;
                return new ScheduledLeg(leg, leg.getDepartureMin() + delay);
            }
            // re-planning: earliest departure at or after 'floor', looking up to 2 days ahead
            for (int d = floor / 1440; d <= floor / 1440 + 2; d++) {
                if (!leg.runsOn(startDate.plusDays(d).getDayOfWeek())) continue;
                int departure = d * 1440 + leg.getDepartureMin() + delay;
                if (departure >= floor) return new ScheduledLeg(leg, departure);
            }
            return null;
        }
        int previousArrival = path.get(path.size() - 1).getArrivalAbs();
        int ready = previousArrival + leg.getBoardingBufferMinutes();
        for (int d = 0; d <= 6; d++) {
            if (!leg.runsOn(startDate.plusDays(d).getDayOfWeek())) continue;
            int departure = d * 1440 + leg.getDepartureMin() + delay;
            if (departure < ready) continue;
            return departure - previousArrival <= MAX_WAIT_MIN ? new ScheduledLeg(leg, departure) : null;
        }
        return null;
    }
}

