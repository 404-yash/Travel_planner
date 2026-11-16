package com.travelplanner.engine.service;

import java.util.Comparator;
import com.travelplanner.engine.model.Route;

public interface RankingStrategy extends Comparator<Route> {
    String getName();
}
