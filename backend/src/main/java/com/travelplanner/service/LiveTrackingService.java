package com.travelplanner.service;

import com.travelplanner.dto.IntermediateStationDto;
import com.travelplanner.dto.LiveTrainStatusDto;
import com.travelplanner.engine.model.Leg;
import com.travelplanner.engine.model.Mode;
import com.travelplanner.engine.service.DisruptionRegistry;
import com.travelplanner.engine.util.TimeFormat;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.*;

@Service
public class LiveTrackingService {

    private final TravelRouteService routeService;

    // Static intermediate corridor templates for Indian transit routes
    private static final Map<String, List<StationTemplate>> CORRIDORS = new HashMap<>();

    static {
        // MMR -> NGP (Manmad to Nagpur)
        CORRIDORS.put("Manmad-Nagpur", List.of(
                new StationTemplate("MMR", "Manmad Jn", 0, 0.0, 1, 0, 20.25, 74.44),
                new StationTemplate("CSN", "Chalisgaon Jn", 67, 0.14, 2, 2, 20.46, 75.01),
                new StationTemplate("JL", "Jalgaon Jn", 160, 0.33, 3, 3, 21.00, 75.56),
                new StationTemplate("BSL", "Bhusawal Jn", 184, 0.38, 2, 10, 21.04, 75.78),
                new StationTemplate("MKU", "Malkapur", 234, 0.48, 1, 2, 20.88, 76.20),
                new StationTemplate("SEG", "Shegaon", 286, 0.59, 2, 3, 20.79, 76.69),
                new StationTemplate("AK", "Akola Jn", 324, 0.67, 2, 5, 20.70, 77.00),
                new StationTemplate("MZR", "Murtizapur", 361, 0.75, 1, 2, 20.73, 77.36),
                new StationTemplate("BD", "Badnera Jn", 403, 0.84, 2, 5, 20.85, 77.72),
                new StationTemplate("WR", "Wardha Jn", 448, 0.93, 2, 3, 20.74, 78.60),
                new StationTemplate("NGP", "Nagpur Jn", 484, 1.0, 1, 0, 21.15, 79.09)
        ));

        // NGP -> PRY (Nagpur to Prayagraj)
        CORRIDORS.put("Nagpur-Prayagraj", List.of(
                new StationTemplate("NGP", "Nagpur Jn", 0, 0.0, 2, 0, 21.15, 79.09),
                new StationTemplate("PAR", "Pandhurna", 104, 0.12, 2, 2, 21.60, 78.52),
                new StationTemplate("BZU", "Betul", 191, 0.23, 2, 3, 21.90, 77.90),
                new StationTemplate("ET", "Itarsi Jn", 298, 0.35, 1, 10, 22.61, 77.76),
                new StationTemplate("PPI", "Pipariya", 365, 0.43, 1, 2, 22.76, 78.35),
                new StationTemplate("JBP", "Jabalpur Jn", 543, 0.65, 4, 10, 23.16, 79.94),
                new StationTemplate("KTE", "Katni Jn", 634, 0.75, 2, 5, 23.83, 80.40),
                new StationTemplate("STA", "Satna Jn", 732, 0.87, 2, 5, 24.58, 80.83),
                new StationTemplate("MKP", "Manikpur Jn", 810, 0.96, 1, 2, 25.04, 81.11),
                new StationTemplate("PRY", "Prayagraj Jn", 840, 1.0, 1, 0, 25.43, 81.85)
        ));

        // Nanded -> Prayagraj
        CORRIDORS.put("Nanded-Prayagraj", List.of(
                new StationTemplate("NED", "Hazur Sahib Nanded", 0, 0.0, 1, 0, 19.16, 77.32),
                new StationTemplate("MUE", "Mudkhed Jn", 23, 0.03, 2, 2, 19.16, 77.51),
                new StationTemplate("NZB", "Nizamabad Jn", 111, 0.12, 1, 5, 18.67, 78.09),
                new StationTemplate("ADB", "Adilabad", 225, 0.24, 2, 5, 19.66, 78.53),
                new StationTemplate("MJRI", "Majri Jn", 336, 0.35, 3, 3, 20.13, 79.02),
                new StationTemplate("SEGM", "Sevagram Jn", 412, 0.43, 1, 2, 20.72, 78.58),
                new StationTemplate("NGP", "Nagpur Jn", 488, 0.51, 2, 15, 21.15, 79.09),
                new StationTemplate("ET", "Itarsi Jn", 786, 0.68, 1, 10, 22.61, 77.76),
                new StationTemplate("JBP", "Jabalpur Jn", 1031, 0.82, 4, 10, 23.16, 79.94),
                new StationTemplate("STA", "Satna Jn", 1220, 0.93, 2, 5, 24.58, 80.83),
                new StationTemplate("PRY", "Prayagraj Jn", 1318, 1.0, 1, 0, 25.43, 81.85)
        ));

        // Pune -> Delhi
        CORRIDORS.put("Pune-Delhi", List.of(
                new StationTemplate("PUNE", "Pune Jn", 0, 0.0, 1, 0, 18.52, 73.86),
                new StationTemplate("DD", "Daund Jn", 75, 0.05, 2, 5, 18.46, 74.58),
                new StationTemplate("ANG", "Ahmednagar", 155, 0.10, 1, 3, 19.09, 74.74),
                new StationTemplate("MMR", "Manmad Jn", 308, 0.20, 3, 5, 20.25, 74.44),
                new StationTemplate("BSL", "Bhusawal Jn", 492, 0.32, 2, 5, 21.04, 75.78),
                new StationTemplate("ET", "Itarsi Jn", 799, 0.52, 1, 10, 22.61, 77.76),
                new StationTemplate("BPL", "Bhopal Jn", 891, 0.58, 2, 5, 23.26, 77.41),
                new StationTemplate("VGLJ", "V Lakshmibai Jhansi", 1183, 0.77, 1, 8, 25.44, 78.56),
                new StationTemplate("GWL", "Gwalior Jn", 1281, 0.83, 2, 2, 26.21, 78.18),
                new StationTemplate("AGC", "Agra Cantt", 1399, 0.91, 1, 5, 27.16, 78.00),
                new StationTemplate("MTJ", "Mathura Jn", 1453, 0.94, 2, 2, 27.49, 77.67),
                new StationTemplate("NDLS", "New Delhi", 1537, 1.0, 5, 0, 28.70, 77.10)
        ));

        // Mumbai -> Kolkata
        CORRIDORS.put("Mumbai-Kolkata", List.of(
                new StationTemplate("CSMT", "Mumbai CSMT", 0, 0.0, 1, 0, 18.94, 72.83),
                new StationTemplate("KYN", "Kalyan Jn", 53, 0.03, 4, 3, 19.24, 73.13),
                new StationTemplate("NK", "Nashik Road", 186, 0.10, 2, 5, 19.95, 73.83),
                new StationTemplate("BSL", "Bhusawal Jn", 443, 0.23, 2, 5, 21.04, 75.78),
                new StationTemplate("AK", "Akola Jn", 583, 0.30, 2, 3, 20.70, 77.00),
                new StationTemplate("BD", "Badnera Jn", 662, 0.34, 2, 3, 20.85, 77.72),
                new StationTemplate("NGP", "Nagpur Jn", 837, 0.43, 2, 10, 21.15, 79.09),
                new StationTemplate("G", "Gondia Jn", 967, 0.49, 3, 2, 21.46, 80.19),
                new StationTemplate("DURG", "Durg Jn", 1102, 0.56, 1, 5, 21.19, 81.28),
                new StationTemplate("R", "Raipur Jn", 1139, 0.58, 1, 5, 21.25, 81.63),
                new StationTemplate("BSP", "Bilaspur Jn", 1250, 0.64, 1, 10, 22.07, 82.14),
                new StationTemplate("ROU", "Rourkela Jn", 1555, 0.79, 1, 5, 22.22, 84.86),
                new StationTemplate("TATA", "Tatanagar Jn", 1718, 0.88, 3, 5, 22.77, 86.19),
                new StationTemplate("HWH", "Howrah (Kolkata)", 1968, 1.0, 8, 0, 22.58, 88.34)
        ));
    }

    private static class StationTemplate {
        final String code;
        final String name;
        final int distKm;
        final double ratio; // fraction of journey (0.0 to 1.0)
        final int platform;
        final int haltMin;
        final double lat;
        final double lng;

        StationTemplate(String code, String name, int distKm, double ratio,
                        int platform, int haltMin, double lat, double lng) {
            this.code = code;
            this.name = name;
            this.distKm = distKm;
            this.ratio = ratio;
            this.platform = platform;
            this.haltMin = haltMin;
            this.lat = lat;
            this.lng = lng;
        }
    }

    public LiveTrackingService(TravelRouteService routeService) {
        this.routeService = routeService;
    }

    /**
     * Computes live running status of any transit service.
     *
     * @param serviceId  the leg id (e.g., T001, 12139, AX006)
     * @param simPercent optional simulation slider (0.0 to 1.0) for interactive demo scrubbing.
     *                   If null, uses real-time clock progress.
     */
    public LiveTrainStatusDto getLiveStatus(String serviceId, Double simPercent) {
        Leg leg = routeService.getAllLegs().stream()
                .filter(l -> l.getId().equalsIgnoreCase(serviceId) || l.getName().toLowerCase().contains(serviceId.toLowerCase()))
                .findFirst()
                .orElse(null);

        if (leg == null) {
            throw new IllegalArgumentException("Transit service not found: " + serviceId);
        }

        DisruptionRegistry disruptions = routeService.getDisruptions();
        boolean isCancelled = disruptions.isCancelled(leg.getId()) || disruptions.isCancelled(serviceId);
        int delayMin = Math.max(disruptions.getDelay(leg.getId()), disruptions.getDelay(serviceId));

        // Also check any numeric/alphanumeric tokens in the name (e.g. "12139", "12105", "AX006")
        for (String part : leg.getName().split("[\\s-]+")) {
            if (disruptions.isCancelled(part)) isCancelled = true;
            delayMin = Math.max(delayMin, disruptions.getDelay(part));
        }

        // Corridor Stations
        List<StationTemplate> templates = findTemplatesForCorridor(leg.getFrom(), leg.getTo());
        List<IntermediateStationDto> stations = new ArrayList<>();

        int depMin = leg.getDepartureMin();
        int totalDur = leg.getDurationMin();
        int totalDist = leg.getDistanceKm();

        for (int i = 0; i < templates.size(); i++) {
            StationTemplate t = templates.get(i);
            int schedArrMin = depMin + (int) Math.round(t.ratio * totalDur);
            int schedDepMin = schedArrMin + t.haltMin;

            int expArrMin = schedArrMin + delayMin;
            int expDepMin = schedDepMin + delayMin;

            IntermediateStationDto s = new IntermediateStationDto();
            s.setStationCode(t.code);
            s.setStationName(t.name);
            s.setDistanceKm(t.distKm);
            s.setPlatformNumber(t.platform);
            s.setHaltMinutes(t.haltMin);
            s.setLatitude(t.lat);
            s.setLongitude(t.lng);
            s.setDelayMinutes(delayMin);

            s.setScheduledArrival(TimeFormat.clock(schedArrMin % 1440));
            s.setScheduledDeparture(TimeFormat.clock(schedDepMin % 1440));
            s.setExpectedArrival(TimeFormat.clock(expArrMin % 1440));
            s.setExpectedDeparture(TimeFormat.clock(expDepMin % 1440));

            stations.add(s);
        }

        // Determine current progress
        double progress;
        if (simPercent != null) {
            progress = Math.max(0.0, Math.min(1.0, simPercent));
        } else {
            // Real clock time progress (IST)
            LocalTime now = LocalTime.now();
            int currentMinute = now.getHour() * 60 + now.getMinute();
            int effectiveDep = depMin + delayMin;
            int effectiveArr = depMin + totalDur + delayMin;

            if (currentMinute < effectiveDep) {
                progress = 0.0;
            } else if (currentMinute >= effectiveArr) {
                progress = 1.0;
            } else {
                progress = (double) (currentMinute - effectiveDep) / totalDur;
            }
        }

        // Determine station status (PASSED, CURRENT, UPCOMING) & train position
        IntermediateStationDto prevStation = stations.get(0);
        IntermediateStationDto nextStation = stations.get(stations.size() - 1);

        // First pass: mark all stations as PASSED or UPCOMING
        for (int i = 0; i < stations.size(); i++) {
            IntermediateStationDto st = stations.get(i);
            StationTemplate tmpl = templates.get(i);

            if (progress >= tmpl.ratio) {
                st.setStatus("PASSED");
                prevStation = st;
            } else {
                st.setStatus("UPCOMING");
                // The FIRST upcoming station after all passed stations is the nextStation
                if (nextStation == stations.get(stations.size() - 1) || nextStation.getStatus().equals("PASSED")) {
                    nextStation = st;
                }
            }
        }

        // Second pass: determine CURRENT station
        if (progress >= 1.0) {
            // Arrived at destination
            stations.get(stations.size() - 1).setStatus("CURRENT");
            nextStation = stations.get(stations.size() - 1);
            prevStation = stations.size() > 1 ? stations.get(stations.size() - 2) : stations.get(0);
        } else if (progress <= 0.0) {
            // Not yet departed
            stations.get(0).setStatus("CURRENT");
            prevStation = stations.get(0);
            if (stations.size() > 1) nextStation = stations.get(1);
        } else {
            // Mid-journey: mark the last PASSED station as CURRENT
            // (the train has departed it but hasn't reached the next one)
            for (int i = stations.size() - 1; i >= 0; i--) {
                if (stations.get(i).getStatus().equals("PASSED")) {
                    stations.get(i).setStatus("CURRENT");
                    prevStation = stations.get(i);
                    break;
                }
            }
            // nextStation is the first UPCOMING station
            for (int i = 0; i < stations.size(); i++) {
                if (stations.get(i).getStatus().equals("UPCOMING")) {
                    nextStation = stations.get(i);
                    break;
                }
            }
        }

        // Interpolated GPS Coordinates
        double currentLat, currentLng;
        int currentSpeed;

        if (isCancelled) {
            currentSpeed = 0;
            currentLat = templates.get(0).lat;
            currentLng = templates.get(0).lng;
        } else if (progress <= 0.0) {
            currentSpeed = 0;
            currentLat = templates.get(0).lat;
            currentLng = templates.get(0).lng;
        } else if (progress >= 1.0) {
            currentSpeed = 0;
            currentLat = templates.get(templates.size() - 1).lat;
            currentLng = templates.get(templates.size() - 1).lng;
        } else {
            // Find bounding template segments
            StationTemplate segStart = templates.get(0);
            StationTemplate segEnd = templates.get(templates.size() - 1);
            for (int i = 0; i < templates.size() - 1; i++) {
                if (progress >= templates.get(i).ratio && progress <= templates.get(i + 1).ratio) {
                    segStart = templates.get(i);
                    segEnd = templates.get(i + 1);
                    break;
                }
            }
            double segRatio = (segEnd.ratio - segStart.ratio) > 0
                    ? (progress - segStart.ratio) / (segEnd.ratio - segStart.ratio)
                    : 0;

            currentLat = segStart.lat + (segEnd.lat - segStart.lat) * segRatio;
            currentLng = segStart.lng + (segEnd.lng - segStart.lng) * segRatio;

            // Speed calculation by transport mode
            if (leg.getMode() == Mode.FLIGHT) {
                currentSpeed = 740;
            } else if (leg.getMode() == Mode.TRAIN) {
                currentSpeed = 82 + (int) (Math.sin(progress * Math.PI * 4) * 14); // ~75-96 km/h
            } else {
                currentSpeed = 55 + (int) (Math.sin(progress * Math.PI * 4) * 10); // ~45-65 km/h
            }
        }

        // Build Response
        LiveTrainStatusDto dto = new LiveTrainStatusDto();
        dto.setServiceId(leg.getId());
        dto.setServiceName(leg.getName());
        dto.setOperator(leg.getOperator());
        dto.setMode(leg.getMode().name());
        dto.setCategory(leg.getCategory());
        dto.setOrigin(leg.getFrom());
        dto.setDestination(leg.getTo());
        dto.setScheduledDeparture(TimeFormat.clock(depMin));
        dto.setScheduledArrival(TimeFormat.clock((depMin + totalDur) % 1440));
        dto.setExpectedDeparture(TimeFormat.clock((depMin + delayMin) % 1440));
        dto.setExpectedArrival(TimeFormat.clock((depMin + totalDur + delayMin) % 1440));
        dto.setDelayMinutes(delayMin);
        dto.setOverallStatus(isCancelled ? "CANCELLED" : (delayMin > 0 ? "DELAYED" : "ON_TIME"));
        dto.setProgressPercent(Math.round(progress * 1000.0) / 10.0);
        dto.setCurrentSpeedKmh(currentSpeed);
        dto.setCurrentLat(currentLat);
        dto.setCurrentLng(currentLng);
        dto.setStations(stations);
        dto.setPreviousStation(prevStation);
        dto.setNextStation(nextStation);
        dto.setLastUpdated(TimeFormat.clock(LocalTime.now().getHour() * 60 + LocalTime.now().getMinute()) + " IST");

        // Status Headline & Description
        if (isCancelled) {
            dto.setCurrentStatusHeadline("SERVICE CANCELLED: Scheduled operations suspended.");
            dto.setCurrentLocationDescription("Standing at origin station (" + leg.getFrom() + ")");
        } else if (progress <= 0.0) {
            dto.setCurrentStatusHeadline("Not started yet. Departs " + leg.getFrom() + " at " + dto.getExpectedDeparture() + " (PF " + stations.get(0).getPlatformNumber() + ")");
            dto.setCurrentLocationDescription("At " + leg.getFrom() + " Junction");
        } else if (progress >= 1.0) {
            dto.setCurrentStatusHeadline("Arrived at final destination: " + leg.getTo() + " (PF " + stations.get(stations.size() - 1).getPlatformNumber() + ")");
            dto.setCurrentLocationDescription("Trip Completed at " + leg.getTo());
        } else {
            double coveredKm = totalDist * progress;
            double remainingToNextKm = Math.max(0, nextStation.getDistanceKm() - coveredKm);
            int minsToNext = Math.max(1, (int) Math.round(remainingToNextKm / Math.max(currentSpeed, 50) * 60));
            dto.setCurrentStatusHeadline("Departed " + prevStation.getStationName() + ". Next: " + nextStation.getStationName() + " in ~" + minsToNext + " mins (PF " + nextStation.getPlatformNumber() + ")");
            dto.setCurrentLocationDescription("Running between " + prevStation.getStationCode() + " and " + nextStation.getStationCode() + " (" + currentSpeed + " km/h)");
        }

        return dto;
    }

    public List<Map<String, Object>> getActiveServices() {
        List<Map<String, Object>> list = new ArrayList<>();
        DisruptionRegistry disruptions = routeService.getDisruptions();

        for (Leg l : routeService.getAllLegs()) {
            Map<String, Object> m = new HashMap<>();
            m.put("serviceId", l.getId());
            m.put("name", l.getName());
            m.put("operator", l.getOperator());
            m.put("mode", l.getMode().name());
            m.put("category", l.getCategory());
            m.put("from", l.getFrom());
            m.put("to", l.getTo());
            m.put("departureTime", TimeFormat.clock(l.getDepartureMin()));
            m.put("arrivalTime", TimeFormat.clock((l.getDepartureMin() + l.getDurationMin()) % 1440));
            m.put("durationMin", l.getDurationMin());
            m.put("isCancelled", disruptions.isCancelled(l.getId()));
            m.put("delayMin", disruptions.getDelay(l.getId()));
            list.add(m);
        }
        return list;
    }

    private List<StationTemplate> findTemplatesForCorridor(String from, String to) {
        String key = from + "-" + to;
        if (CORRIDORS.containsKey(key)) {
            return CORRIDORS.get(key);
        }

        // Reverse corridor if available
        String revKey = to + "-" + from;
        if (CORRIDORS.containsKey(revKey)) {
            List<StationTemplate> orig = CORRIDORS.get(revKey);
            List<StationTemplate> reversed = new ArrayList<>();
            int maxDist = orig.get(orig.size() - 1).distKm;
            for (int i = orig.size() - 1; i >= 0; i--) {
                StationTemplate o = orig.get(i);
                double newRatio = 1.0 - o.ratio;
                int newDist = maxDist - o.distKm;
                reversed.add(new StationTemplate(o.code, o.name, newDist, newRatio, o.platform, o.haltMin, o.lat, o.lng));
            }
            return reversed;
        }

        // Dynamic generation between any arbitrary city pair
        double[] fromCoords = routeService.getCoordinates().getOrDefault(from, new double[]{20.0, 77.0});
        double[] toCoords = routeService.getCoordinates().getOrDefault(to, new double[]{24.0, 80.0});

        List<StationTemplate> dyn = new ArrayList<>();
        dyn.add(new StationTemplate(from.substring(0, Math.min(3, from.length())).toUpperCase(), from + " Central", 0, 0.0, 1, 0, fromCoords[0], fromCoords[1]));

        int count = 4;
        for (int i = 1; i <= count; i++) {
            double ratio = (double) i / (count + 1);
            double lat = fromCoords[0] + (toCoords[0] - fromCoords[0]) * ratio;
            double lng = fromCoords[1] + (toCoords[1] - fromCoords[1]) * ratio;
            dyn.add(new StationTemplate("HALT-" + i, "Waypoint " + i + " Junction", (int) (ratio * 500), ratio, (i % 3) + 1, 2, lat, lng));
        }

        dyn.add(new StationTemplate(to.substring(0, Math.min(3, to.length())).toUpperCase(), to + " Terminal", 500, 1.0, 1, 0, toCoords[0], toCoords[1]));
        return dyn;
    }
}
