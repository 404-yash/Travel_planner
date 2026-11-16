package com.travelplanner.engine.service;

import com.travelplanner.engine.model.Leg;
import com.travelplanner.engine.model.Mode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

/**
 * STRATEGY: Applies dynamic pricing policies for demo realism (weekend surcharges,
 * peak flights, last-minute booking premiums).
 */
public final class FarePolicy {
    private FarePolicy() {}

    public static int adjustFare(Leg leg, LocalDate travelDate) {
        if (leg == null || travelDate == null) return leg != null ? leg.getFare() : 0;
        double multiplier = 1.0;

        DayOfWeek dow = travelDate.getDayOfWeek();
        if (leg.getMode() == Mode.FLIGHT && (dow == DayOfWeek.FRIDAY || dow == DayOfWeek.SUNDAY)) {
            multiplier += 0.15; // +15% for peak weekend flights
        } else if (leg.getMode() == Mode.TRAIN && (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY)) {
            multiplier += 0.10; // +10% for weekend trains
        }

        long daysAhead = ChronoUnit.DAYS.between(LocalDate.now(), travelDate);
        if (daysAhead >= 0 && daysAhead <= 2) {
            multiplier += 0.10; // +10% last-minute booking premium
        }

        return (int) Math.round(leg.getFare() * multiplier);
    }
}
