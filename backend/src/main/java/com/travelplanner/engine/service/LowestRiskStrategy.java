package com.travelplanner.engine.service;

import com.travelplanner.engine.model.Route;

public class LowestRiskStrategy implements RankingStrategy {
    @Override
    public String getName() { return "Lowest connection risk"; }

    @Override
    public int compare(Route a, Route b) {
        int c = Integer.compare(a.getConnectionRisk().ordinal(), b.getConnectionRisk().ordinal());
        return c != 0 ? c : Integer.compare(a.getTotalWaitingMin(), b.getTotalWaitingMin());
    }
}
