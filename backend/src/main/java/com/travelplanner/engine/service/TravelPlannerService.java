package com.travelplanner.engine.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeSet;
import com.travelplanner.engine.model.Leg;
import com.travelplanner.engine.model.Route;
import com.travelplanner.engine.model.ScheduledLeg;
import com.travelplanner.engine.model.SearchRequest;
import com.travelplanner.engine.model.TripPair;

/** FACADE: the GUI talks only to this class; it hides data loading, route finding and ranking. */
public class TravelPlannerService {
    private static final int MAX_PER_SIGNATURE = 2;

    private final RouteFinder finder;
    private final List<String> cities;
    private final Map<String, double[]> coordinates;

    public TravelPlannerService(TransportProvider provider, DisruptionRegistry disruptions) throws DataLoadException {
        List<Leg> legs = provider.loadLegs();
        this.finder = new RouteFinder(legs, disruptions);
        TreeSet<String> allCities = new TreeSet<>();
        for (Leg leg : legs) { allCities.add(leg.getFrom()); allCities.add(leg.getTo()); }
        this.cities = new ArrayList<>(allCities);
        this.coordinates = provider.loadCoordinates();
    }

    public List<String> getOrigins() {
        return new ArrayList<>(cities);
    }

    public List<String> getDestinations(String origin) {
        List<String> list = new ArrayList<>();
        for (String city : cities) if (!city.equals(origin)) list.add(city);
        return list;
    }

    public Map<String, double[]> getCoordinates() {
        return coordinates;
    }

    public List<Route> plan(SearchRequest request) throws NoRouteFoundException {
        List<Route> all = finder.findAll(request.getOrigin(), request.getDestination(),
                request.getDate(), request.getMaxLegs(),
                request.getAllowedModes(), request.getDepartureWindow());
        if (request.getRequiredStop() != null) {
            all.removeIf(route -> route.getLegs().stream().noneMatch(
                    sl -> sl.getLeg().getFrom().equalsIgnoreCase(request.getRequiredStop())
                       || sl.getLeg().getTo().equalsIgnoreCase(request.getRequiredStop())));
        }
        if (request.getMaxFare() < Integer.MAX_VALUE) {
            all.removeIf(route -> route.getTotalFare() > request.getMaxFare());
        }
        if (all.isEmpty()) {
            throw new NoRouteFoundException("No route found from " + request.getOrigin() + " to "
                    + request.getDestination() + " on " + request.getDate() + ". Try another date, adjust filters, or restore cancelled services.");
        }
        Collections.sort(all, request.getStrategy());
        List<Route> result = new ArrayList<>();
        Map<String, Integer> perSignature = new HashMap<>();
        for (Route r : all) {
            int used = perSignature.getOrDefault(r.getSignature(), 0);
            if (used >= MAX_PER_SIGNATURE) continue;
            perSignature.put(r.getSignature(), used + 1);
            result.add(r);
            if (result.size() >= request.getMaxResults()) break;
        }
        return result;
    }
}
