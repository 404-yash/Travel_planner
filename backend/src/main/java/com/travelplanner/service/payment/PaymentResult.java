package com.travelplanner.service.payment;

public class PaymentResult {
    private final boolean success;
    private final String transactionRef;
    private final String message;

    public PaymentResult(boolean success, String transactionRef, String message) {
        this.success = success;
        this.transactionRef = transactionRef;
        this.message = message;
    }

    public static PaymentResult ok(String txRef) {
        return new PaymentResult(true, txRef, "Payment authorized successfully.");
    }

    public static PaymentResult failed(String message) {
        return new PaymentResult(false, null, message);
    }

    public boolean isSuccess() { return success; }
    public String getTransactionRef() { return transactionRef; }
    public String getMessage() { return message; }
}
