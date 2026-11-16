package com.travelplanner.engine.service;

import com.travelplanner.engine.model.Route;

public class BalancedStrategy implements RankingStrategy {
    @Override
    public String getName() { return "Best value (money + time)"; }

    @Override
    public int compare(Route a, Route b) {
        double scoreA = a.getTotalFare() + a.getTotalDurationMin() * 6.0;
        double scoreB = b.getTotalFare() + b.getTotalDurationMin() * 6.0;
        return Double.compare(scoreA, scoreB);
    }
}
