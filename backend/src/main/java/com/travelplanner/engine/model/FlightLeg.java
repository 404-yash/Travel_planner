package com.travelplanner.engine.model;

import java.time.DayOfWeek;
import java.util.Set;

public class FlightLeg extends Leg {
    public FlightLeg(String id, String operator, String name, String category, String from, String to,
                     int departureMin, int durationMin, int fare, int distanceKm, Set<DayOfWeek> days) {
        super(id, operator, name, category, from, to, departureMin, durationMin, fare, distanceKm, days);
    }

    @Override public Mode getMode() { return Mode.FLIGHT; }
    @Override public int getBoardingBufferMinutes() { return 120; }
    @Override public String getTravelTip() { return "Do web check-in and reach the airport 2 hours early."; }
    @Override public double getCO2PerKm() { return 0.150; }
}
