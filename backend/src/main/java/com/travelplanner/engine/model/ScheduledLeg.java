package com.travelplanner.engine.model;

/** A Leg placed on the journey's timeline. Times are minutes since midnight of the first day (may exceed 1440). */
public final class ScheduledLeg {
    private final Leg leg;
    private final int departureAbs;

    public ScheduledLeg(Leg leg, int departureAbs) {
        this.leg = leg;
        this.departureAbs = departureAbs;
    }

    public Leg getLeg() { return leg; }
    public int getDepartureAbs() { return departureAbs; }
    public int getArrivalAbs() { return departureAbs + leg.getDurationMin(); }
}
