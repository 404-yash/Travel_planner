package com.travelplanner.engine.data;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.DayOfWeek;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import com.travelplanner.engine.model.Leg;
import com.travelplanner.engine.model.LegFactory;
import com.travelplanner.engine.model.Mode;
import com.travelplanner.engine.model.TripPair;
import com.travelplanner.engine.service.DataLoadException;
import com.travelplanner.engine.service.TransportProvider;
import com.travelplanner.engine.util.TimeFormat;

/** Reads schedule and coordinate data from data/travel-data.json. */
public class JsonTransportProvider implements TransportProvider {
    private final Path file;
    private Map<String, Object> root;

    public JsonTransportProvider(Path file) { this.file = file; }
    public JsonTransportProvider() { this.file = null; }

    @SuppressWarnings("unchecked")
    private Map<String, Object> root() throws DataLoadException {
        if (root == null) {
            try {
                String text;
                if (file != null && Files.exists(file)) {
                    text = new String(Files.readAllBytes(file), StandardCharsets.UTF_8);
                } else {
                    java.io.InputStream is = getClass().getClassLoader().getResourceAsStream("data/travel-data.json");
                    if (is == null) {
                        Path fallback = Path.of("backend/src/main/resources/data/travel-data.json");
                        if (Files.exists(fallback)) text = new String(Files.readAllBytes(fallback), StandardCharsets.UTF_8);
                        else throw new DataLoadException("Cannot find data/travel-data.json on classpath or disk");
                    } else {
                        text = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                    }
                }
                Object parsed = JsonParser.parse(text);
                if (!(parsed instanceof Map)) throw new DataLoadException("JSON root must be an object");
                root = (Map<String, Object>) parsed;
            } catch (IOException | RuntimeException e) {
                throw new DataLoadException("Could not read travel data: " + e.getMessage(), e);
            }
        }
        return root;
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<Leg> loadLegs() throws DataLoadException {
        List<Leg> legs = new ArrayList<>();
        Object raw = root().get("legs");
        if (!(raw instanceof List)) throw new DataLoadException("'legs' array missing in " + file);
        for (Object o : (List<Object>) raw) {
            Map<String, Object> m = (Map<String, Object>) o;
            try {
                int distance = m.containsKey("distanceKm") ? ((Number) m.get("distanceKm")).intValue() : 300;
                legs.add(LegFactory.create(
                        Mode.fromString(str(m, "mode")), str(m, "id"), str(m, "operator"), str(m, "name"),
                        str(m, "category"), str(m, "from"), str(m, "to"),
                        TimeFormat.parseClock(str(m, "departure")),
                        ((Number) m.get("durationMin")).intValue(), ((Number) m.get("fare")).intValue(),
                        distance,
                        parseDays((List<Object>) m.get("days"))));
            } catch (RuntimeException e) {
                throw new DataLoadException("Bad leg entry " + m.get("id") + ": " + e.getMessage(), e);
            }
        }
        return legs;
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<TripPair> loadSupportedTrips() throws DataLoadException {
        List<TripPair> trips = new ArrayList<>();
        Object raw = root().get("trips");
        if (raw instanceof List) {
            for (Object o : (List<Object>) raw) {
                Map<String, Object> m = (Map<String, Object>) o;
                trips.add(new TripPair(str(m, "from"), str(m, "to")));
            }
        }
        return trips;
    }

    @Override
    @SuppressWarnings("unchecked")
    public Map<String, double[]> loadCoordinates() throws DataLoadException {
        Map<String, double[]> coords = new HashMap<>();
        Object raw = root().get("coordinates");
        if (raw instanceof Map) {
            Map<String, Object> map = (Map<String, Object>) raw;
            for (Map.Entry<String, Object> entry : map.entrySet()) {
                if (entry.getValue() instanceof List) {
                    List<Object> list = (List<Object>) entry.getValue();
                    if (list.size() >= 2) {
                        double lat = ((Number) list.get(0)).doubleValue();
                        double lon = ((Number) list.get(1)).doubleValue();
                        coords.put(entry.getKey(), new double[]{lat, lon});
                    }
                }
            }
        }
        return coords;
    }

    private static String str(Map<String, Object> m, String key) {
        Object v = m.get(key);
        if (v == null) throw new IllegalArgumentException("missing field '" + key + "'");
        return v.toString();
    }

    private static Set<DayOfWeek> parseDays(List<Object> list) {
        if (list == null || list.isEmpty()) throw new IllegalArgumentException("missing field 'days'");
        if (list.size() == 1 && "ALL".equalsIgnoreCase(list.get(0).toString())) return EnumSet.allOf(DayOfWeek.class);
        Set<DayOfWeek> days = EnumSet.noneOf(DayOfWeek.class);
        for (Object o : list) {
            String code = o.toString().toUpperCase();
            boolean found = false;
            for (DayOfWeek d : DayOfWeek.values()) {
                if (d.name().startsWith(code)) { days.add(d); found = true; }
            }
            if (!found) throw new IllegalArgumentException("unknown day '" + code + "'");
        }
        return days;
    }
}
