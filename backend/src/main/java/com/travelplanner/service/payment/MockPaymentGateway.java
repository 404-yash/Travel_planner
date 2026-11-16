package com.travelplanner.service.payment;

import org.springframework.stereotype.Component;
import java.util.UUID;

@Component
public class MockPaymentGateway implements PaymentGateway {

    @Override
    public PaymentResult charge(String method, int amountRupees, String payerRef, String paymentDetails) {
        if (amountRupees <= 0) {
            return PaymentResult.failed("Invalid charge amount: ₹" + amountRupees);
        }

        // Demo rule: card ending 0000 or details ending 0000 fails
        if (paymentDetails != null && paymentDetails.trim().endsWith("0000")) {
            return PaymentResult.failed("Payment Declined: Card verification failed (Demo rule: numbers ending 0000 fail).");
        }

        // Demo payment succeeded
        String txRef = "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return PaymentResult.ok(txRef);
    }
}
