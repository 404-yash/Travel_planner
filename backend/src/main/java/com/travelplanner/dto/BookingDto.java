package com.travelplanner.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class BookingDto {
    private Long id;
    private String bookingRef;
    private String passengerName;
    private String passengerEmail;
    private String origin;
    private String destination;
    private LocalDate travelDate;
    private String departureTime;
    private String arrivalTime;
    private int durationMin;
    private int transfers;
    private int totalFare;
    private double co2Kg;
    private String modeSummary;
    private String itineraryDetails;
    private String status;
    private LocalDateTime bookedAt;

    private int passengers = 1;
    private String paymentStatus = "PAID";
    private String paymentRef;
    private int refundAmount = 0;
    private String contactPhone;
    private List<String> legIds = new ArrayList<>();

    public BookingDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBookingRef() { return bookingRef; }
    public void setBookingRef(String bookingRef) { this.bookingRef = bookingRef; }
    public String getPassengerName() { return passengerName; }
    public void setPassengerName(String passengerName) { this.passengerName = passengerName; }
    public String getPassengerEmail() { return passengerEmail; }
    public void setPassengerEmail(String passengerEmail) { this.passengerEmail = passengerEmail; }
    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public LocalDate getTravelDate() { return travelDate; }
    public void setTravelDate(LocalDate travelDate) { this.travelDate = travelDate; }
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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getBookedAt() { return bookedAt; }
    public void setBookedAt(LocalDateTime bookedAt) { this.bookedAt = bookedAt; }

    public int getPassengers() { return passengers; }
    public void setPassengers(int passengers) { this.passengers = passengers; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public String getPaymentRef() { return paymentRef; }
    public void setPaymentRef(String paymentRef) { this.paymentRef = paymentRef; }
    public int getRefundAmount() { return refundAmount; }
    public void setRefundAmount(int refundAmount) { this.refundAmount = refundAmount; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public List<String> getLegIds() { return legIds; }
    public void setLegIds(List<String> legIds) { this.legIds = legIds; }
}
