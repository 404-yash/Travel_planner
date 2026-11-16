package com.travelplanner.dto;

public class LegDto {
    private String id;
    private String mode;
    private String operator;
    private String name;
    private String category;
    private String from;
    private String to;
    private String departureTime;
    private String arrivalTime;
    private int durationMin;
    private int fare;
    private int distanceKm;
    private double co2Kg;
    private String travelTip;
    private int layoverBeforeMin;
    private int boardingBufferMin;
    private String state = "ON_TIME";
    private int delayMin = 0;

    public LegDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }
    public String getOperator() { return operator; }
    public void setOperator(String operator) { this.operator = operator; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getFrom() { return from; }
    public void setFrom(String from) { this.from = from; }
    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }
    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }
    public String getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(String arrivalTime) { this.arrivalTime = arrivalTime; }
    public int getDurationMin() { return durationMin; }
    public void setDurationMin(int durationMin) { this.durationMin = durationMin; }
    public int getFare() { return fare; }
    public void setFare(int fare) { this.fare = fare; }
    public int getDistanceKm() { return distanceKm; }
    public void setDistanceKm(int distanceKm) { this.distanceKm = distanceKm; }
    public double getCo2Kg() { return co2Kg; }
    public void setCo2Kg(double co2Kg) { this.co2Kg = co2Kg; }
    public String getTravelTip() { return travelTip; }
    public void setTravelTip(String travelTip) { this.travelTip = travelTip; }
    public int getLayoverBeforeMin() { return layoverBeforeMin; }
    public void setLayoverBeforeMin(int layoverBeforeMin) { this.layoverBeforeMin = layoverBeforeMin; }
    public int getBoardingBufferMin() { return boardingBufferMin; }
    public void setBoardingBufferMin(int boardingBufferMin) { this.boardingBufferMin = boardingBufferMin; }
    public String getState() { return state; }
    public void setState(String state) { this.state = state; }
    public int getDelayMin() { return delayMin; }
    public void setDelayMin(int delayMin) { this.delayMin = delayMin; }
}
