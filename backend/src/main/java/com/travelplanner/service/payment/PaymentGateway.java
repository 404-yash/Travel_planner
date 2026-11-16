package com.travelplanner.service.payment;

/**
 * STRATEGY pattern: abstraction for payment processors (UPI, Cards, Netbanking).
 */
public interface PaymentGateway {
    PaymentResult charge(String method, int amountRupees, String payerRef, String paymentDetails);
}
