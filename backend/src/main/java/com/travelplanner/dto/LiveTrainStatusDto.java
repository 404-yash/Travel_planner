package com.travelplanner.dto;

import java.util.ArrayList;
import java.util.List;

public class LiveTrainStatusDto {
    private String serviceId;
    private String serviceName;
    private String operator;
    private String mode; // TRAIN, BUS, FLIGHT
    private String category;
    private String origin;
    private String destination;
    private String scheduledDeparture;
    private String scheduledArrival;
    private String expectedDeparture;
    private String expectedArrival;
    private String overallStatus; // ON_TIME, DELAYED, CANCELLED
    private int delayMinutes;
    private int currentSpeedKmh;
    private double progressPercent;
    private String currentStatusHeadline;
    private String currentLocationDescription;
    private double currentLat;
    private double currentLng;
    private IntermediateStationDto nextStation;
    private IntermediateStationDto previousStation;
    private List<IntermediateStationDto> stations = new ArrayList<>();
    private String lastUpdated;

    public LiveTrainStatusDto() {}

    public String getServiceId() { return serviceId; }
    public void setServiceId(String serviceId) { this.serviceId = serviceId; }

    public String getServiceName() { return serviceName; }
    public void setServiceName(String serviceName) { this.serviceName = serviceName; }

    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getScheduledDeparture() { return scheduledDeparture; }
    public void setScheduledDeparture(String scheduledDeparture) { this.scheduledDeparture = scheduledDeparture; }

    public String getScheduledArrival() { return scheduledArrival; }
    public void setScheduledArrival(String scheduledArrival) { this.scheduledArrival = scheduledArrival; }

    public String getExpectedDeparture() { return expectedDeparture; }
    public void setExpectedDeparture(String expectedDeparture) { this.expectedDeparture = expectedDeparture; }

    public String getExpectedArrival() { return expectedArrival; }
    public void setExpectedArrival(String expectedArrival) { this.expectedArrival = expectedArrival; }

    public String getOverallStatus() { return overallStatus; }
    public void setOverallStatus(String overallStatus) { this.overallStatus = overallStatus; }

    public int getDelayMinutes() { return delayMinutes; }
    public void setDelayMinutes(int delayMinutes) { this.delayMinutes = delayMinutes; }

    public int getCurrentSpeedKmh() { return currentSpeedKmh; }
    public void setCurrentSpeedKmh(int currentSpeedKmh) { this.currentSpeedKmh = currentSpeedKmh; }

    public double getProgressPercent() { return progressPercent; }
    public void setProgressPercent(double progressPercent) { this.progressPercent = progressPercent; }

    public String getCurrentStatusHeadline() { return currentStatusHeadline; }
    public void setCurrentStatusHeadline(String currentStatusHeadline) { this.currentStatusHeadline = currentStatusHeadline; }

    public String getCurrentLocationDescription() { return currentLocationDescription; }
    public void setCurrentLocationDescription(String currentLocationDescription) { this.currentLocationDescription = currentLocationDescription; }

    public double getCurrentLat() { return currentLat; }
    public void setCurrentLat(double currentLat) { this.currentLat = currentLat; }

    public double getCurrentLng() { return currentLng; }
    public void setCurrentLng(double currentLng) { this.currentLng = currentLng; }

    public IntermediateStationDto getNextStation() { return nextStation; }
    public void setNextStation(IntermediateStationDto nextStation) { this.nextStation = nextStation; }

    public IntermediateStationDto getPreviousStation() { return previousStation; }
    public void setPreviousStation(IntermediateStationDto previousStation) { this.previousStation = previousStation; }

    public List<IntermediateStationDto> getStations() { return stations; }
    public void setStations(List<IntermediateStationDto> stations) { this.stations = stations; }

    public String getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(String lastUpdated) { this.lastUpdated = lastUpdated; }
}
