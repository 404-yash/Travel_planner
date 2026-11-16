package com.travelplanner.dto;

import java.util.List;

public class RouteDto {
    private String id;
    private String signature;
    private String origin;
    private String destination;
    private String departureTime;
    private String arrivalTime;
    private int durationMin;
    private int waitingMin;
    private int transfers;
    private int totalFare;
    private double co2Kg;
    private String risk;
    private String modeSummary;
    private List<String> highlights;
    private List<LegDto> legs;

    public RouteDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSignature() { return signature; }
    public void setSignature(String signature) { this.signature = signature; }
    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }
    public String getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(String arrivalTime) { this.arrivalTime = arrivalTime; }
    public int getDurationMin() { return durationMin; }
    public void setDurationMin(int durationMin) { this.durationMin = durationMin; }
    public int getWaitingMin() { return waitingMin; }
    public void setWaitingMin(int waitingMin) { this.waitingMin = waitingMin; }
    public int getTransfers() { return transfers; }
    public void setTransfers(int transfers) { this.transfers = transfers; }
    public int getTotalFare() { return totalFare; }
    public void setTotalFare(int totalFare) { this.totalFare = totalFare; }
    public double getCo2Kg() { return co2Kg; }
    public void setCo2Kg(double co2Kg) { this.co2Kg = co2Kg; }
    public String getRisk() { return risk; }
    public void setRisk(String risk) { this.risk = risk; }
    public String getModeSummary() { return modeSummary; }
    public void setModeSummary(String modeSummary) { this.modeSummary = modeSummary; }
    public List<String> getHighlights() { return highlights; }
    public void setHighlights(List<String> highlights) { this.highlights = highlights; }
    public List<LegDto> getLegs() { return legs; }
    public void setLegs(List<LegDto> legs) { this.legs = legs; }
}
