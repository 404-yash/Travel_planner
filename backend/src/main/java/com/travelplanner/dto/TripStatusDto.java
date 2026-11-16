package com.travelplanner.dto;

import java.util.ArrayList;
import java.util.List;

public class TripStatusDto {
    private Long bookingId;
    private String headline;
    private String overallState; // ON_TIME, DELAYED, CANCELLED
    private int totalDelayMinutes;
    private String departureTime;
    private int firstLegDepAbsMin;
    private List<LegStatusItem> legs = new ArrayList<>();
    private List<RouteDto> alternatives = new ArrayList<>();

    public static class LegStatusItem {
        private String legId;
        private String from;
        private String to;
        private String state;
        private int delayMinutes;
        private int boardingBufferMin;
        private String departureTime;
        private String arrivalTime;
        private String mode;
        private String name;
        private String operator;

        public LegStatusItem() {}

        public String getLegId() { return legId; }
        public void setLegId(String legId) { this.legId = legId; }
        public String getFrom() { return from; }
        public void setFrom(String from) { this.from = from; }
        public String getTo() { return to; }
        public void setTo(String to) { this.to = to; }
        public String getState() { return state; }
        public void setState(String state) { this.state = state; }
        public int getDelayMinutes() { return delayMinutes; }
        public void setDelayMinutes(int delayMinutes) { this.delayMinutes = delayMinutes; }
        public int getBoardingBufferMin() { return boardingBufferMin; }
        public void setBoardingBufferMin(int boardingBufferMin) { this.boardingBufferMin = boardingBufferMin; }
        public String getDepartureTime() { return departureTime; }
        public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }
        public String getArrivalTime() { return arrivalTime; }
        public void setArrivalTime(String arrivalTime) { this.arrivalTime = arrivalTime; }
        public String getMode() { return mode; }
        public void setMode(String mode) { this.mode = mode; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getOperator() { return operator; }
        public void setOperator(String operator) { this.operator = operator; }
    }

    public TripStatusDto() {}

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }
    public String getOverallState() { return overallState; }
    public void setOverallState(String overallState) { this.overallState = overallState; }
    public int getTotalDelayMinutes() { return totalDelayMinutes; }
    public void setTotalDelayMinutes(int totalDelayMinutes) { this.totalDelayMinutes = totalDelayMinutes; }
    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }
    public int getFirstLegDepAbsMin() { return firstLegDepAbsMin; }
    public void setFirstLegDepAbsMin(int firstLegDepAbsMin) { this.firstLegDepAbsMin = firstLegDepAbsMin; }
    public List<LegStatusItem> getLegs() { return legs; }
    public void setLegs(List<LegStatusItem> legs) { this.legs = legs; }
    public List<RouteDto> getAlternatives() { return alternatives; }
    public void setAlternatives(List<RouteDto> alternatives) { this.alternatives = alternatives; }
}
