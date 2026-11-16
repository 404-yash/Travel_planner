package com.travelplanner.engine.model;

import java.time.DayOfWeek;
import java.util.Set;

public class TrainLeg extends Leg {
    public TrainLeg(String id, String operator, String name, String category, String from, String to,
                    int departureMin, int durationMin, int fare, int distanceKm, Set<DayOfWeek> days) {
        super(id, operator, name, category, from, to, departureMin, durationMin, fare, distanceKm, days);
    }

    @Override public Mode getMode() { return Mode.TRAIN; }
    @Override public int getBoardingBufferMinutes() { return 45; }
    @Override public String getTravelTip() {
        return isDaily() ? "Book a berth in advance." : "Runs only on selected days \u2013 check the schedule.";
    }
    @Override public double getCO2PerKm() { return 0.035; }
}
