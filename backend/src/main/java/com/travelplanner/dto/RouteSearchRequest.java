package com.travelplanner.dto;

import java.util.List;

public class RouteSearchRequest {
    private String origin;
    private String destination;
    private String date; // yyyy-MM-dd
    private String requiredStop;
    private String strategy = "CHEAPEST"; // CHEAPEST, FASTEST, FEWEST_TRANSFERS, BALANCED, WAITING_TIME, LOWEST_RISK, GREENEST
    private int maxLegs = 3;
    private Integer maxFare;
    private List<String> allowedModes; // BUS, TRAIN, FLIGHT
    private String departureWindow = "ANY"; // ANY, MORNING, AFTERNOON, EVENING, NIGHT

    public RouteSearchRequest() {}

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public String getRequiredStop() { return requiredStop; }
    public void setRequiredStop(String requiredStop) { this.requiredStop = requiredStop; }
    public String getStrategy() { return strategy; }
    public void setStrategy(String strategy) { this.strategy = strategy; }
    public int getMaxLegs() { return maxLegs; }
    public void setMaxLegs(int maxLegs) { this.maxLegs = maxLegs; }
    public Integer getMaxFare() { return maxFare; }
    public void setMaxFare(Integer maxFare) { this.maxFare = maxFare; }
    public List<String> getAllowedModes() { return allowedModes; }
    public void setAllowedModes(List<String> allowedModes) { this.allowedModes = allowedModes; }
    public String getDepartureWindow() { return departureWindow; }
    public void setDepartureWindow(String departureWindow) { this.departureWindow = departureWindow; }
}
