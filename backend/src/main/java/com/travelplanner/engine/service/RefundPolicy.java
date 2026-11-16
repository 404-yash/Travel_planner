package com.travelplanner.engine.service;

/** Simple, transparent refund rule shown to the traveller BEFORE they cancel. */
public final class RefundPolicy {
    private RefundPolicy() { }

    /** @param hoursBeforeDeparture hours from now until the first leg departs (negative = already left) */
    public static int refundPercent(long hoursBeforeDeparture) {
        if (hoursBeforeDeparture >= 48) return 90;
        if (hoursBeforeDeparture >= 24) return 75;
        if (hoursBeforeDeparture >= 6) return 50;
        return 0;
    }

    public static int refundAmount(int totalFare, long hoursBeforeDeparture) {
        return totalFare * refundPercent(hoursBeforeDeparture) / 100;
    }

    public static String describe(long hoursBeforeDeparture) {
        int pct = refundPercent(hoursBeforeDeparture);
        return pct == 0 ? "No refund: the trip departs in less than 6 hours."
                : "You will get " + pct + "% back.";
    }
}
