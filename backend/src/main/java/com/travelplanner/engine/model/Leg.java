package com.travelplanner.engine.model;

import java.time.DayOfWeek;
import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

/**
 * ABSTRACTION: one scheduled hop between two cities (a single bus, train or flight).
 * ENCAPSULATION: all fields are private and final; the constructor validates its input.
 * Concrete modes (BusLeg, TrainLeg, FlightLeg) override the abstract methods (POLYMORPHISM).
 */
public abstract class Leg {
    private final String id;
    private final String operator;
    private final String name;
    private final String category;
    private final String from;
    private final String to;
    private final int departureMin;   // minutes after midnight
    private final int durationMin;
    private final int fare;           // in rupees
    private final int distanceKm;
    private final Set<DayOfWeek> days;

    protected Leg(String id, String operator, String name, String category,
                  String from, String to, int departureMin, int durationMin,
                  int fare, int distanceKm, Set<DayOfWeek> days) {
        if (id == null || id.isEmpty()) throw new IllegalArgumentException("Leg id is required");
        if (from == null || to == null || from.equals(to))
            throw new IllegalArgumentException("Leg " + id + " needs two different cities");
        if (departureMin < 0 || departureMin >= 1440)
            throw new IllegalArgumentException("Leg " + id + " has an invalid departure time");
        if (durationMin <= 0) throw new IllegalArgumentException("Leg " + id + " has an invalid duration");
        if (fare < 0) throw new IllegalArgumentException("Leg " + id + " has a negative fare");
        if (distanceKm <= 0) throw new IllegalArgumentException("Leg " + id + " has an invalid distance");
        if (days == null || days.isEmpty()) throw new IllegalArgumentException("Leg " + id + " runs on no day");
        this.id = id;
        this.operator = operator;
        this.name = name;
        this.category = category;
        this.from = from;
        this.to = to;
        this.departureMin = departureMin;
        this.durationMin = durationMin;
        this.fare = fare;
        this.distanceKm = distanceKm;
        this.days = Collections.unmodifiableSet(EnumSet.copyOf(days));
    }

    public String getId() { return id; }
    public String getOperator() { return operator; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getFrom() { return from; }
    public String getTo() { return to; }
    public int getDepartureMin() { return departureMin; }
    public int getDurationMin() { return durationMin; }
    public int getFare() { return fare; }
    public int getDistanceKm() { return distanceKm; }
    public Set<DayOfWeek> getDays() { return days; }
    public boolean runsOn(DayOfWeek day) { return days.contains(day); }
    public boolean isDaily() { return days.size() == 7; }

    /** Which kind of transport this is. */
    public abstract Mode getMode();

    /** Minimum minutes a traveller needs between arriving from a previous leg and boarding this one. */
    public abstract int getBoardingBufferMinutes();

    /** A short travel tip that depends on the mode. */
    public abstract String getTravelTip();

    /** CO2 emissions per kilometre for this mode of transport (kg). */
    public abstract double getCO2PerKm();

    @Override
    public String toString() {
        return getMode().getLabel() + " " + name + " " + from + "->" + to;
    }
}
