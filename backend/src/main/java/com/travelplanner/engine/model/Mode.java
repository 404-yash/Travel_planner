package com.travelplanner.engine.model;

public enum Mode {
    BUS("Bus"), TRAIN("Train"), FLIGHT("Flight");
    private final String label;
    Mode(String label) { this.label = label; }
    public String getLabel() { return label; }
    public static Mode fromString(String s) {
        return valueOf(s.toUpperCase().trim());
    }
}
