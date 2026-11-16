package com.travelplanner.dto;

public class RefundPreviewDto {
    private int percent;
    private int amount;
    private String message;
    private boolean eligible;

    public RefundPreviewDto() {}

    public RefundPreviewDto(int percent, int amount, String message, boolean eligible) {
        this.percent = percent;
        this.amount = amount;
        this.message = message;
        this.eligible = eligible;
    }

    public int getPercent() { return percent; }
    public void setPercent(int percent) { this.percent = percent; }
    public int getAmount() { return amount; }
    public void setAmount(int amount) { this.amount = amount; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public boolean isEligible() { return eligible; }
    public void setEligible(boolean eligible) { this.eligible = eligible; }
}
