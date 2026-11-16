package com.travelplanner.engine.model;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/** COMPOSITION: a Route is made of ScheduledLegs and cannot exist without them. Immutable. */
public final class Route {
    private final List<ScheduledLeg> legs;

    public Route(List<ScheduledLeg> legs) {
        if (legs == null || legs.isEmpty()) throw new IllegalArgumentException("A route needs at least one leg");
        this.legs = Collections.unmodifiableList(new ArrayList<>(legs));
    }

    public List<ScheduledLeg> getLegs() { return legs; }
    public String getOrigin() { return legs.get(0).getLeg().getFrom(); }
    public String getDestination() { return legs.get(legs.size() - 1).getLeg().getTo(); }
    public int getDepartureAbs() { return legs.get(0).getDepartureAbs(); }
    public int getArrivalAbs() { return legs.get(legs.size() - 1).getArrivalAbs(); }
    public int getTotalDurationMin() { return getArrivalAbs() - getDepartureAbs(); }
    public int getTransfers() { return legs.size() - 1; }

    /** Total connection time across all transfers, excluding time spent on vehicles. */
    public int getTotalWaitingMin() {
        int total = 0;
        for (int i = 1; i < legs.size(); i++) total += getLayoverBefore(i);
        return total;
    }

    public ConnectionRisk getConnectionRisk() {
        boolean medium = false;
        for (int i = 1; i < legs.size(); i++) {
            int wait = getLayoverBefore(i);
            if (wait < 60) return ConnectionRisk.HIGH;
            if (wait < 120) medium = true;
        }
        return medium ? ConnectionRisk.MEDIUM : ConnectionRisk.LOW;
    }

    public int getTotalFare() {
        int sum = 0;
        for (ScheduledLeg l : legs) sum += l.getLeg().getFare();
        return sum;
    }

    /** Estimated CO2 emissions in kilograms for the entire route. */
    public double getEstimatedCO2Kg() {
        double sum = 0;
        for (ScheduledLeg l : legs) sum += l.getLeg().getDistanceKm() * l.getLeg().getCO2PerKm();
        return sum;
    }

    /** Minutes spent waiting before leg number 'index' (0 for the first leg). */
    public int getLayoverBefore(int index) {
        if (index == 0) return 0;
        return legs.get(index).getDepartureAbs() - legs.get(index - 1).getArrivalAbs();
    }

    public String getCitySummary() {
        StringBuilder sb = new StringBuilder(getOrigin());
        for (ScheduledLeg l : legs) sb.append(" > ").append(l.getLeg().getTo());
        return sb.toString();
    }

    public String getModeSummary() {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < legs.size(); i++) {
            if (i > 0) sb.append(" + ");
            sb.append(legs.get(i).getLeg().getMode().getLabel());
        }
        return sb.toString();
    }

    /** Same cities and same modes = same kind of journey (used to keep the result list varied). */
    public String getSignature() {
        return getCitySummary() + "|" + getModeSummary();
    }
}
