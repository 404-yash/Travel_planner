package com.travelplanner.engine.service;

import java.util.List;
import java.util.Map;
import com.travelplanner.engine.model.Leg;
import com.travelplanner.engine.model.TripPair;

public interface TransportProvider {
    List<Leg> loadLegs() throws DataLoadException;
    List<TripPair> loadSupportedTrips() throws DataLoadException;
    Map<String, double[]> loadCoordinates() throws DataLoadException;
}
