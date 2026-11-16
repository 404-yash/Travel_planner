package com.travelplanner.engine.model;

import java.time.DayOfWeek;
import java.util.Set;

public class BusLeg extends Leg {
    public BusLeg(String id, String operator, String name, String category, String from, String to,
                  int departureMin, int durationMin, int fare, int distanceKm, Set<DayOfWeek> days) {
        super(id, operator, name, category, from, to, departureMin, durationMin, fare, distanceKm, days);
    }

    @Override public Mode getMode() { return Mode.BUS; }
    @Override public int getBoardingBufferMinutes() { return 30; }
    @Override public String getTravelTip() { return "Reach the boarding point 30 minutes early."; }
    @Override public double getCO2PerKm() { return 0.068; }
}
