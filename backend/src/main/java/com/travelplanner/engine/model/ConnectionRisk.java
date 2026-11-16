package com.travelplanner.engine.model;

public enum ConnectionRisk {
    LOW("Low"), MEDIUM("Medium"), HIGH("High");
    private final String label;
    ConnectionRisk(String label) { this.label = label; }
    public String getLabel() { return label; }
}
