package com.travelplanner.dto;

import java.util.ArrayList;
import java.util.List;

public class BookingRequest {
    private String passengerName;
    private String passengerEmail;
    private String origin;
    private String destination;
    private String travelDate;
    private String departureTime;
    private String arrivalTime;
    private int durationMin;
    private int transfers;
    private int totalFare;
    private double co2Kg;
    private String modeSummary;
    private String itineraryDetails;

    // Phase 2 / Trustworthy booking fields
    private List<String> legIds = new ArrayList<>();
    private int passengers = 1;
    private List<PassengerDto> travellers = new ArrayList<>();
    private String contactPhone;
    private String paymentMethod;
    private String paymentDetails;

    public BookingRequest() {}

    public String getPassengerName() { return passengerName; }
    public void setPassengerName(String passengerName) { this.passengerName = passengerName; }
    public String getPassengerEmail() { return passengerEmail; }
    public void setPassengerEmail(String passengerEmail) { this.passengerEmail = passengerEmail; }
    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public String getTravelDate() { return travelDate; }
    public void setTravelDate(String travelDate) { this.travelDate = travelDate; }
    public String getDepartureTime() { return departureTime; }
    public void setDepartureTime(String departureTime) { this.departureTime = departureTime; }
    public String getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(String arrivalTime) { this.arrivalTime = arrivalTime; }
    public int getDurationMin() { return durationMin; }
    public void setDurationMin(int durationMin) { this.durationMin = durationMin; }
    public int getTransfers() { return transfers; }
    public void setTransfers(int transfers) { this.transfers = transfers; }
    public int getTotalFare() { return totalFare; }
    public void setTotalFare(int totalFare) { this.totalFare = totalFare; }
    public double getCo2Kg() { return co2Kg; }
    public void setCo2Kg(double co2Kg) { this.co2Kg = co2Kg; }
    public String getModeSummary() { return modeSummary; }
    public void setModeSummary(String modeSummary) { this.modeSummary = modeSummary; }
    public String getItineraryDetails() { return itineraryDetails; }
    public void setItineraryDetails(String itineraryDetails) { this.itineraryDetails = itineraryDetails; }

    public List<String> getLegIds() { return legIds; }
    public void setLegIds(List<String> legIds) { this.legIds = legIds; }
    public int getPassengers() { return passengers; }
    public void setPassengers(int passengers) { this.passengers = passengers; }
    public List<PassengerDto> getTravellers() { return travellers; }
    public void setTravellers(List<PassengerDto> travellers) { this.travellers = travellers; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getPaymentDetails() { return paymentDetails; }
    public void setPaymentDetails(String paymentDetails) { this.paymentDetails = paymentDetails; }
}
