package com.travelplanner.engine.model;

import java.time.DayOfWeek;
import java.util.Set;

public final class LegFactory {
    private LegFactory() { }

    public static Leg create(Mode mode, String id, String operator, String name,
                              String category, String from, String to,
                              int departureMin, int durationMin, int fare,
                              int distanceKm, Set<DayOfWeek> days) {
        switch (mode) {
            case BUS:    return new BusLeg(id, operator, name, category, from, to, departureMin, durationMin, fare, distanceKm, days);
            case TRAIN:  return new TrainLeg(id, operator, name, category, from, to, departureMin, durationMin, fare, distanceKm, days);
            case FLIGHT: return new FlightLeg(id, operator, name, category, from, to, departureMin, durationMin, fare, distanceKm, days);
            default:     throw new IllegalArgumentException("Unknown mode: " + mode);
        }
    }
}
