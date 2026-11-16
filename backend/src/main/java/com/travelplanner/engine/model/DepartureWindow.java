package com.travelplanner.engine.model;

public enum DepartureWindow {
    ANY("Any time", 0, 1440),
    MORNING("Morning (06–12)", 360, 720),
    AFTERNOON("Afternoon (12–18)", 720, 1080),
    EVENING("Evening (18–00)", 1080, 1440),
    NIGHT("Night (00–06)", 0, 360);

    private final String label;
    private final int fromMin;
    private final int toMin;

    DepartureWindow(String label, int fromMin, int toMin) {
        this.label = label;
        this.fromMin = fromMin;
        this.toMin = toMin;
    }

    public String getLabel() { return label; }

    public boolean contains(int minuteOfDay) {
        return minuteOfDay >= fromMin && minuteOfDay < toMin;
    }

    @Override public String toString() { return label; }
}
