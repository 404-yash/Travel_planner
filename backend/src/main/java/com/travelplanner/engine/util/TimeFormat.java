package com.travelplanner.engine.util;

/** Small helpers for showing minutes as clock times and durations. */
public final class TimeFormat {
    private TimeFormat() { }

    /** abs = minutes since midnight of day 1; values over 1440 show as "(+1d)". */
    public static String clock(int abs) {
        int inDay = abs % 1440;
        if (inDay < 0) inDay += 1440;
        String s = String.format("%02d:%02d", inDay / 60, inDay % 60);
        return abs >= 1440 ? s + " (+" + (abs / 1440) + "d)" : s;
    }

    public static String duration(int minutes) {
        int h = minutes / 60, m = minutes % 60;
        if (h == 0) return m + "m";
        return m == 0 ? h + "h" : h + "h " + m + "m";
    }

    public static int parseClock(String hhmm) {
        String[] p = hhmm.trim().split(":");
        if (p.length != 2) throw new IllegalArgumentException("Bad time: " + hhmm);
        return Integer.parseInt(p[0]) * 60 + Integer.parseInt(p[1]);
    }
}
