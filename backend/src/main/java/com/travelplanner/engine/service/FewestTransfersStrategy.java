package com.travelplanner.engine.service;

import com.travelplanner.engine.model.Route;

public class FewestTransfersStrategy implements RankingStrategy {
    @Override
    public String getName() { return "Fewest transfers"; }

    @Override
    public int compare(Route a, Route b) {
        int c = Integer.compare(a.getTransfers(), b.getTransfers());
        return c != 0 ? c : Integer.compare(a.getTotalDurationMin(), b.getTotalDurationMin());
    }
}
