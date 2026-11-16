package com.travelplanner.engine.service;

import com.travelplanner.engine.model.DepartureWindow;
import com.travelplanner.engine.model.Mode;
import com.travelplanner.engine.model.Route;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;

/**
 * Checks a booked trip against the live DisruptionRegistry. If a leg is cancelled it proposes
 * alternatives from that leg's origin to the final destination, departing no earlier than planned.
 */
public class TripMonitor {
    public enum State { ON_TIME, DELAYED, CANCELLED }

    /** A booked leg: its id and when it was planned to run (minutes since midnight of the trip's first day). */
    public static final class PlannedLeg {
        public final String legId, from, to;
        public final int departureAbs, arrivalAbs;
        public PlannedLeg(String legId, String from, String to, int departureAbs, int arrivalAbs) {
            this.legId = legId; this.from = from; this.to = to;
            this.departureAbs = departureAbs; this.arrivalAbs = arrivalAbs;
        }
    }

    public static final class LegStatus {
        public final String legId;
        public final State state;
        public final int delayMin;
        LegStatus(String legId, State state, int delayMin) { this.legId = legId; this.state = state; this.delayMin = delayMin; }
    }

    public static final class Report {
        public final List<LegStatus> legs = new ArrayList<>();
        public final List<Route> alternatives = new ArrayList<>();
        public String headline = "Your trip is on time.";
        public boolean needsAction() { return !alternatives.isEmpty() || headline.startsWith("A service"); }
    }

    private final RouteFinder finder;
    private final DisruptionRegistry disruptions;

    public TripMonitor(RouteFinder finder, DisruptionRegistry disruptions) {
        this.finder = finder;
        this.disruptions = disruptions;
    }

    public Report check(List<PlannedLeg> planned, LocalDate tripStart) {
        Report report = new Report();
        PlannedLeg firstBroken = null;
        int totalDelay = 0;
        for (PlannedLeg p : planned) {
            if (disruptions.isCancelled(p.legId)) {
                report.legs.add(new LegStatus(p.legId, State.CANCELLED, 0));
                if (firstBroken == null) firstBroken = p;
            } else if (disruptions.getDelay(p.legId) > 0) {
                int d = disruptions.getDelay(p.legId);
                totalDelay += d;
                report.legs.add(new LegStatus(p.legId, State.DELAYED, d));
            } else {
                report.legs.add(new LegStatus(p.legId, State.ON_TIME, 0));
            }
        }
        String finalDest = planned.get(planned.size() - 1).to;
        if (firstBroken != null) {
            report.headline = "A service on your trip was cancelled. Here are ways to still reach "
                    + finalDest + ".";
            List<Route> alts = finder.findAll(firstBroken.from, finalDest, tripStart, 3,
                    EnumSet.allOf(Mode.class), DepartureWindow.ANY, firstBroken.departureAbs);
            alts.sort(Comparator.comparingInt(Route::getArrivalAbs).thenComparingInt(Route::getTotalFare));
            // keep it simple for the traveller: at most one option per kind of journey, best 4
            java.util.Set<String> seen = new java.util.HashSet<>();
            for (Route r : alts) {
                if (report.alternatives.size() >= 4) break;
                if (seen.add(r.getSignature())) report.alternatives.add(r);
            }
        } else if (totalDelay > 0) {
            report.headline = "Delay of " + totalDelay + " min on your trip. Check your connections.";
        }
        return report;
    }
}
