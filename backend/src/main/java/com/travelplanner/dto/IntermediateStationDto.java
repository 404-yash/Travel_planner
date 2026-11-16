package com.travelplanner.dto;

public class IntermediateStationDto {
    private String stationCode;
    private String stationName;
    private int distanceKm;
    private String scheduledArrival;
    private String scheduledDeparture;
    private String expectedArrival;
    private String expectedDeparture;
    private int delayMinutes;
    private int platformNumber;
    private int haltMinutes;
    private String status; // PASSED, CURRENT, UPCOMING
    private double latitude;
    private double longitude;

    public IntermediateStationDto() {}

    public IntermediateStationDto(String stationCode, String stationName, int distanceKm,
                                  String scheduledArrival, String scheduledDeparture,
                                  String expectedArrival, String expectedDeparture,
                                  int delayMinutes, int platformNumber, int haltMinutes,
                                  String status, double latitude, double longitude) {
        this.stationCode = stationCode;
        this.stationName = stationName;
        this.distanceKm = distanceKm;
        this.scheduledArrival = scheduledArrival;
        this.scheduledDeparture = scheduledDeparture;
        this.expectedArrival = expectedArrival;
        this.expectedDeparture = expectedDeparture;
        this.delayMinutes = delayMinutes;
        this.platformNumber = platformNumber;
        this.haltMinutes = haltMinutes;
        this.status = status;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getStationCode() { return stationCode; }
    public void setStationCode(String stationCode) { this.stationCode = stationCode; }

    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }

    public int getDistanceKm() { return distanceKm; }
    public void setDistanceKm(int distanceKm) { this.distanceKm = distanceKm; }

    public String getScheduledArrival() { return scheduledArrival; }
    public void setScheduledArrival(String scheduledArrival) { this.scheduledArrival = scheduledArrival; }

    public String getScheduledDeparture() { return scheduledDeparture; }
    public void setScheduledDeparture(String scheduledDeparture) { this.scheduledDeparture = scheduledDeparture; }

    public String getExpectedArrival() { return expectedArrival; }
    public void setExpectedArrival(String expectedArrival) { this.expectedArrival = expectedArrival; }

    public String getExpectedDeparture() { return expectedDeparture; }
    public void setExpectedDeparture(String expectedDeparture) { this.expectedDeparture = expectedDeparture; }

    public int getDelayMinutes() { return delayMinutes; }
    public void setDelayMinutes(int delayMinutes) { this.delayMinutes = delayMinutes; }

    public int getPlatformNumber() { return platformNumber; }
    public void setPlatformNumber(int platformNumber) { this.platformNumber = platformNumber; }

    public int getHaltMinutes() { return haltMinutes; }
    public void setHaltMinutes(int haltMinutes) { this.haltMinutes = haltMinutes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public double getLatitude() { return latitude; }
    public void setLatitude(double latitude) { this.latitude = latitude; }

    public double getLongitude() { return longitude; }
    public void setLongitude(double longitude) { this.longitude = longitude; }
}
