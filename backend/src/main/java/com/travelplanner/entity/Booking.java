package com.travelplanner.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String bookingRef;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String passengerName;

    @Column(nullable = false)
    private String passengerEmail;

    @Column(nullable = false)
    private String origin;

    @Column(nullable = false)
    private String destination;

    @Column(nullable = false)
    private LocalDate travelDate;

    @Column(nullable = false)
    private String departureTime;

    @Column(nullable = false)
    private String arrivalTime;

    @Column(nullable = false)
    private int durationMin;

    @Column(nullable = false)
    private int transfers;

    @Column(nullable = false)
    private int totalFare;

    @Column(nullable = false)
    private double co2Kg;

    @Column(nullable = false)
    private String modeSummary;

    @Column(columnDefinition = "TEXT")
    private String itineraryDetails;

    @Column(nullable = false)
    private String status = "CONFIRMED"; // CONFIRMED, CANCELLED, CHANGED

    @Column(nullable = false)
    private int passengers = 1;

    @Column(columnDefinition = "TEXT")
    private String plannedLegs; // id|from|to|depAbs|arrAbs\n...

    private String paymentRef;
    private String paymentStatus = "PAID";
    private int refundAmount = 0;
    private String contactPhone;

    @Column(columnDefinition = "TEXT")
    private String travellersJson;

    private LocalDateTime bookedAt = LocalDateTime.now();

    public Booking() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBookingRef() { return bookingRef; }
    public void setBookingRef(String bookingRef) { this.bookingRef = bookingRef; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
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
    public int getPassengers() { return passengers; }
    public void setPassengers(int passengers) { this.passengers = passengers; }
    public String getPlannedLegs() { return plannedLegs; }
    public void setPlannedLegs(String plannedLegs) { this.plannedLegs = plannedLegs; }
    public String getPaymentRef() { return paymentRef; }
    public void setPaymentRef(String paymentRef) { this.paymentRef = paymentRef; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public int getRefundAmount() { return refundAmount; }
    public void setRefundAmount(int refundAmount) { this.refundAmount = refundAmount; }
    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
    public String getTravellersJson() { return travellersJson; }
    public void setTravellersJson(String travellersJson) { this.travellersJson = travellersJson; }
    public LocalDateTime getBookedAt() { return bookedAt; }
    public void setBookedAt(LocalDateTime bookedAt) { this.bookedAt = bookedAt; }
}
