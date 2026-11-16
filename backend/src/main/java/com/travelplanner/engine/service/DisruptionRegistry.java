package com.travelplanner.engine.service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;

/** OBSERVER pattern: listeners (the GUI) are told whenever a service is cancelled, delayed or restored. */
public class DisruptionRegistry {
    public interface Listener { void onDisruptionChange(String message); }

    private final Set<String> cancelledLegIds = ConcurrentHashMap.newKeySet();
    private final Map<String, Integer> delayedLegs = new ConcurrentHashMap<>();
    private final List<Listener> listeners = new CopyOnWriteArrayList<>();

    public void addListener(Listener l) { listeners.add(l); }

    public boolean isCancelled(String legId) { return cancelledLegIds.contains(legId); }
    public int getCancelledCount() { return cancelledLegIds.size(); }

    public void cancel(String legId, String description) {
        cancelledLegIds.add(legId);
        fireChange("Cancelled: " + description);
    }

    public void addDelay(String legId, int delayMinutes, String description) {
        delayedLegs.merge(legId, delayMinutes, Integer::sum);   // atomic: two admins adding delays cannot lose one
        fireChange("Delayed: " + description);
    }

    public int getDelay(String legId) {
        return delayedLegs.getOrDefault(legId, 0);
    }

    public boolean hasDelays() { return !delayedLegs.isEmpty(); }
    public int getTotalDelayedCount() { return delayedLegs.size(); }

    public void reset() {
        cancelledLegIds.clear();
        delayedLegs.clear();
        fireChange("All services restored");
    }

    private void fireChange(String message) {
        for (Listener l : listeners) l.onDisruptionChange(message);
    }
}

