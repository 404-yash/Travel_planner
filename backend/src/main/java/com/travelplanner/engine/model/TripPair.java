package com.travelplanner.engine.model;

import java.util.Objects;

/** One supported origin/destination pair (kept for compatibility). */
public final class TripPair {
    private final String from;
    private final String to;

    public TripPair(String from, String to) {
        this.from = from;
        this.to = to;
    }

    public String getFrom() { return from; }
    public String getTo() { return to; }

    @Override public boolean equals(Object o) {
        if (!(o instanceof TripPair)) return false;
        TripPair t = (TripPair) o;
        return from.equals(t.from) && to.equals(t.to);
    }

    @Override public int hashCode() { return Objects.hash(from, to); }
    @Override public String toString() { return from + " -> " + to; }
}
