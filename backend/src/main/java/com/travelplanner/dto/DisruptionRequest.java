package com.travelplanner.dto;

public class DisruptionRequest {
    private String legId;
    private String action; // CANCEL, DELAY, RESTORE
    private int delayMinutes;
    private String description;

    public DisruptionRequest() {}

    public String getLegId() { return legId; }
    public void setLegId(String legId) { this.legId = legId; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public int getDelayMinutes() { return delayMinutes; }
    public void setDelayMinutes(int delayMinutes) { this.delayMinutes = delayMinutes; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
