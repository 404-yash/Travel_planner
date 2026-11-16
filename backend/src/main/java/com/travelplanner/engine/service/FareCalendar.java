package com.travelplanner.engine.service;

import com.travelplanner.engine.model.DepartureWindow;
import com.travelplanner.engine.model.Mode;
import com.travelplanner.engine.model.Route;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;

/** Cheapest and fastest option for each of the next N days, so travellers can pick the best day to go. */
public class FareCalendar {
    public static final class DayFare {
        public final LocalDate date;
        public final int routeCount;
        public final Integer cheapestFare;      // null when nothing runs that day
        public final Integer fastestMinutes;

        DayFare(LocalDate date, int routeCount, Integer cheapestFare, Integer fastestMinutes) {
            this.date = date;
            this.routeCount = routeCount;
            this.cheapestFare = cheapestFare;
            this.fastestMinutes = fastestMinutes;
        }
    }

    private final RouteFinder finder;

    public FareCalendar(RouteFinder finder) { this.finder = finder; }

    public List<DayFare> build(String origin, String destination, LocalDate from, int days,
                               int maxLegs, EnumSet<Mode> modes) {
        List<DayFare> out = new ArrayList<>();
        for (int i = 0; i < days; i++) {
            LocalDate d = from.plusDays(i);
            List<Route> routes = finder.findAll(origin, destination, d, maxLegs, modes, DepartureWindow.ANY);
            Integer cheapest = null, fastest = null;
            for (Route r : routes) {
                int totalFare = r.getLegs().stream().mapToInt(sl -> FarePolicy.adjustFare(sl.getLeg(), d)).sum();
                if (cheapest == null || totalFare < cheapest) cheapest = totalFare;
                if (fastest == null || r.getTotalDurationMin() < fastest) fastest = r.getTotalDurationMin();
            }
            out.add(new DayFare(d, routes.size(), cheapest, fastest));
        }
        return out;
    }
}
