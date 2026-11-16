package com.travelplanner.engine.service;

import com.travelplanner.engine.model.Route;

public class CheapestStrategy implements RankingStrategy {
    @Override
    public String getName() { return "Cheapest first"; }

    @Override
    public int compare(Route a, Route b) {
        int c = Integer.compare(a.getTotalFare(), b.getTotalFare());
        return c != 0 ? c : Integer.compare(a.getTotalDurationMin(), b.getTotalDurationMin());
    }
}
