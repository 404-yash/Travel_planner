package com.travelplanner.engine.service;

import com.travelplanner.engine.model.Route;

public class GreenestStrategy implements RankingStrategy {
    @Override
    public String getName() { return "Greenest (lowest CO\u2082)"; }

    @Override
    public int compare(Route a, Route b) {
        int c = Double.compare(a.getEstimatedCO2Kg(), b.getEstimatedCO2Kg());
        return c != 0 ? c : Integer.compare(a.getTotalDurationMin(), b.getTotalDurationMin());
    }
}
