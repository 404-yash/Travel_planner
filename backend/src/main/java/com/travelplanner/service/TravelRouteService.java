package com.travelplanner.service;

import com.travelplanner.dto.LegDto;
import com.travelplanner.dto.RouteDto;
import com.travelplanner.dto.RouteSearchRequest;
import com.travelplanner.engine.data.JsonTransportProvider;
import com.travelplanner.engine.model.*;
import com.travelplanner.engine.service.*;
import com.travelplanner.engine.util.TimeFormat;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class TravelRouteService {

    private final DisruptionRegistry disruptions = new DisruptionRegistry();
    private RouteFinder routeFinder;
    private TripMonitor tripMonitor;
    private FareCalendar fareCalendar;
    private List<Leg> allLegs = new ArrayList<>();
    private List<String> allCities = new ArrayList<>();
    private Map<String, double[]> coordinates = new HashMap<>();

    @PostConstruct
    public void init() {
        try {
            TransportProvider provider = new JsonTransportProvider();
            this.allLegs = provider.loadLegs();
            this.coordinates = provider.loadCoordinates();
            this.routeFinder = new RouteFinder(allLegs, disruptions);
            this.tripMonitor = new TripMonitor(routeFinder, disruptions);
            this.fareCalendar = new FareCalendar(routeFinder);

            TreeSet<String> set = new TreeSet<>();
            for (Leg leg : allLegs) {
                set.add(leg.getFrom());
                set.add(leg.getTo());
            }
            this.allCities = new ArrayList<>(set);

            // JVM Warmup
            try {
                routeFinder.findAll("Nanded", "Prayagraj", LocalDate.now(), 3, EnumSet.allOf(Mode.class), DepartureWindow.ANY);
            } catch (Exception ignored) {}

        } catch (DataLoadException e) {
            throw new RuntimeException("Failed to initialize transit engine: " + e.getMessage(), e);
        }
    }

    public List<String> getCities() {
        return allCities;
    }

    public Map<String, double[]> getCoordinates() {
        return coordinates;
    }

    public List<Leg> getAllLegs() {
        return allLegs;
    }

    public DisruptionRegistry getDisruptions() {
        return disruptions;
    }

    public List<FareCalendar.DayFare> fareCalendar(String from, String to, LocalDate start, int days) {
        return fareCalendar.build(from, to, start, Math.min(Math.max(days, 1), 14), 3, EnumSet.allOf(Mode.class));
    }

    public Optional<Route> resolve(String from, String to, LocalDate date, List<String> legIds) {
        return RouteResolver.resolve(routeFinder, from, to, date, legIds);
    }

    public TripMonitor.Report monitor(List<TripMonitor.PlannedLeg> planned, LocalDate start) {
        return tripMonitor.check(planned, start);
    }

    public int calculateRouteFare(Route route, LocalDate travelDate) {
        return route.getLegs().stream()
                .mapToInt(sl -> FarePolicy.adjustFare(sl.getLeg(), travelDate))
                .sum();
    }

    public RouteDto toRouteDto(Route r, LocalDate date) {
        RouteDto dto = toDto(r, date, List.of());
        dto.setId("route-alt-" + Math.abs(r.getSignature().hashCode()));
        return dto;
    }

    public List<RouteDto> search(RouteSearchRequest req) {
        if (req.getOrigin() == null || req.getDestination() == null) {
            throw new IllegalArgumentException("Origin and Destination are required");
        }
        if (req.getOrigin().equalsIgnoreCase(req.getDestination())) {
            throw new IllegalArgumentException("Origin and Destination cannot be the same city");
        }

        LocalDate travelDate = req.getDate() != null && !req.getDate().isBlank()
                ? LocalDate.parse(req.getDate())
                : LocalDate.now();

        // Allowed modes
        EnumSet<Mode> modes = EnumSet.allOf(Mode.class);
        if (req.getAllowedModes() != null && !req.getAllowedModes().isEmpty()) {
            modes = EnumSet.noneOf(Mode.class);
            for (String m : req.getAllowedModes()) {
                try { modes.add(Mode.fromString(m)); } catch (Exception ignored) {}
            }
            if (modes.isEmpty()) modes = EnumSet.allOf(Mode.class);
        }

        // Departure window
        DepartureWindow window = DepartureWindow.ANY;
        if (req.getDepartureWindow() != null) {
            try { window = DepartureWindow.valueOf(req.getDepartureWindow().toUpperCase()); } catch (Exception ignored) {}
        }

        // Strategy
        RankingStrategy strategy = parseStrategy(req.getStrategy());

        int maxLegs = req.getMaxLegs() > 0 && req.getMaxLegs() <= 5 ? req.getMaxLegs() : 2;

        List<Route> found = routeFinder.findAll(req.getOrigin(), req.getDestination(), travelDate, maxLegs, modes, window);

        // Filter by required stop (must be visited either as from or to)
        if (req.getRequiredStop() != null && !req.getRequiredStop().isBlank() && !"Any stop".equalsIgnoreCase(req.getRequiredStop())) {
            String stop = req.getRequiredStop().trim();
            found.removeIf(r -> r.getLegs().stream().noneMatch(
                    sl -> sl.getLeg().getFrom().equalsIgnoreCase(stop) || sl.getLeg().getTo().equalsIgnoreCase(stop)));
        }

        // Filter by max fare
        if (req.getMaxFare() != null && req.getMaxFare() > 0) {
            found.removeIf(r -> calculateRouteFare(r, travelDate) > req.getMaxFare());
        }

        // Sort by strategy
        Collections.sort(found, strategy);

        // Deduplicate: max 2 per signature
        List<Route> result = new ArrayList<>();
        Map<String, Integer> perSignature = new HashMap<>();
        for (Route r : found) {
            int used = perSignature.getOrDefault(r.getSignature(), 0);
            if (used >= 2) continue;
            perSignature.put(r.getSignature(), used + 1);
            result.add(r);
            if (result.size() >= 20) break;
        }

        // Identify highlights
        int minFare = result.stream().mapToInt(r -> calculateRouteFare(r, travelDate)).min().orElse(Integer.MAX_VALUE);
        int minDur = result.stream().mapToInt(Route::getTotalDurationMin).min().orElse(Integer.MAX_VALUE);
        double minCo2 = result.stream().mapToDouble(Route::getEstimatedCO2Kg).min().orElse(Double.MAX_VALUE);

        List<RouteDto> dtos = new ArrayList<>();
        int routeIndex = 1;
        for (Route r : result) {
            List<String> tags = new ArrayList<>();
            int fare = calculateRouteFare(r, travelDate);
            if (fare == minFare) tags.add("Cheapest");
            if (r.getTotalDurationMin() == minDur) tags.add("Fastest");
            if (r.getTransfers() == 0) tags.add("Direct");
            if (Math.abs(r.getEstimatedCO2Kg() - minCo2) < 0.1) tags.add("🌱 Greenest");

            RouteDto dto = toDto(r, travelDate, tags);
            dto.setId("route-" + (routeIndex++));
            dtos.add(dto);
        }

        return dtos;
    }

    private RankingStrategy parseStrategy(String s) {
        if (s == null) return new BalancedStrategy();
        switch (s.toUpperCase().trim()) {
            case "FASTEST": return new FastestStrategy();
            case "FEWEST_TRANSFERS": return new FewestTransfersStrategy();
            case "BALANCED": return new BalancedStrategy();
            case "WAITING_TIME": return new WaitingTimeStrategy();
            case "LOWEST_RISK": return new LowestRiskStrategy();
            case "GREENEST": return new GreenestStrategy();
            case "CHEAPEST": return new CheapestStrategy();
            default: return new BalancedStrategy();
        }
    }

    private RouteDto toDto(Route r, LocalDate date, List<String> tags) {
        RouteDto dto = new RouteDto();
        dto.setSignature(r.getSignature());
        dto.setOrigin(r.getOrigin());
        dto.setDestination(r.getDestination());
        dto.setDepartureTime(formatDateTime(date, r.getDepartureAbs()));
        dto.setArrivalTime(formatDateTime(date, r.getArrivalAbs()));
        dto.setDurationMin(r.getTotalDurationMin());
        dto.setWaitingMin(r.getTotalWaitingMin());
        dto.setTransfers(r.getTransfers());
        dto.setCo2Kg(Math.round(r.getEstimatedCO2Kg() * 10.0) / 10.0);
        dto.setRisk(r.getConnectionRisk().getLabel());
        dto.setModeSummary(r.getModeSummary());
        dto.setHighlights(tags);

        int totalFare = 0;
        List<LegDto> legs = new ArrayList<>();
        for (int i = 0; i < r.getLegs().size(); i++) {
            ScheduledLeg sl = r.getLegs().get(i);
            Leg leg = sl.getLeg();
            LegDto ldto = new LegDto();
            ldto.setId(leg.getId());
            ldto.setMode(leg.getMode().name());
            ldto.setOperator(leg.getOperator());
            ldto.setName(leg.getName());
            ldto.setCategory(leg.getCategory());
            ldto.setFrom(leg.getFrom());
            ldto.setTo(leg.getTo());
            ldto.setDepartureTime(formatDateTime(date, sl.getDepartureAbs()));
            ldto.setArrivalTime(formatDateTime(date, sl.getArrivalAbs()));
            ldto.setDurationMin(leg.getDurationMin());

            int legFare = FarePolicy.adjustFare(leg, date);
            ldto.setFare(legFare);
            totalFare += legFare;

            ldto.setDistanceKm(leg.getDistanceKm());
            ldto.setCo2Kg(Math.round(leg.getDistanceKm() * leg.getCO2PerKm() * 10.0) / 10.0);
            ldto.setTravelTip(leg.getTravelTip());
            ldto.setLayoverBeforeMin(r.getLayoverBefore(i));
            ldto.setBoardingBufferMin(leg.getBoardingBufferMinutes());

            if (disruptions.isCancelled(leg.getId())) {
                ldto.setState("CANCELLED");
            } else if (disruptions.getDelay(leg.getId()) > 0) {
                ldto.setState("DELAYED");
                ldto.setDelayMin(disruptions.getDelay(leg.getId()));
            } else {
                ldto.setState("ON_TIME");
            }

            legs.add(ldto);
        }
        dto.setTotalFare(totalFare);
        dto.setLegs(legs);
        return dto;
    }

    private String formatDateTime(LocalDate base, int absMin) {
        int days = absMin / 1440;
        int min = absMin % 1440;
        LocalDate d = base.plusDays(days);
        return d.toString() + " " + TimeFormat.clock(min);
    }
}
