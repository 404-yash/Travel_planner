package com.travelplanner.engine.service;

import com.travelplanner.engine.model.Route;

public class WaitingTimeStrategy implements RankingStrategy {
    @Override
    public String getName() { return "Least waiting first"; }

    @Override
    public int compare(Route a, Route b) {
        int c = Integer.compare(a.getTotalWaitingMin(), b.getTotalWaitingMin());
        return c != 0 ? c : Integer.compare(a.getTotalDurationMin(), b.getTotalDurationMin());
    }
}
