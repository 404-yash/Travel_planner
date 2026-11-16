package com.travelplanner.engine.model;

import java.time.LocalDate;
import java.util.EnumSet;
import com.travelplanner.engine.service.RankingStrategy;

/** BUILDER pattern: a search request has several optional settings, so it is built step by step. */
public final class SearchRequest {
    private final String origin;
    private final String destination;
    private final LocalDate date;
    private final String requiredStop;
    private final RankingStrategy strategy;
    private final int maxLegs;
    private final int maxResults;
    private final int maxFare;
    private final EnumSet<Mode> allowedModes;
    private final DepartureWindow departureWindow;

    private SearchRequest(Builder b) {
        this.origin = b.origin;
        this.destination = b.destination;
        this.date = b.date;
        this.requiredStop = b.requiredStop;
        this.strategy = b.strategy;
        this.maxLegs = b.maxLegs;
        this.maxResults = b.maxResults;
        this.maxFare = b.maxFare;
        this.allowedModes = b.allowedModes;
        this.departureWindow = b.departureWindow;
    }

    public String getOrigin() { return origin; }
    public String getDestination() { return destination; }
    public LocalDate getDate() { return date; }
    public String getRequiredStop() { return requiredStop; }
    public RankingStrategy getStrategy() { return strategy; }
    public int getMaxLegs() { return maxLegs; }
    public int getMaxResults() { return maxResults; }
    public int getMaxFare() { return maxFare; }
    public EnumSet<Mode> getAllowedModes() { return allowedModes; }
    public DepartureWindow getDepartureWindow() { return departureWindow; }

    public static Builder builder() { return new Builder(); }

    public static final class Builder {
        private String origin;
        private String destination;
        private LocalDate date = LocalDate.now();
        private String requiredStop;
        private RankingStrategy strategy;
        private int maxLegs = 3;
        private int maxResults = 15;
        private int maxFare = Integer.MAX_VALUE;
        private EnumSet<Mode> allowedModes = EnumSet.allOf(Mode.class);
        private DepartureWindow departureWindow = DepartureWindow.ANY;

        public Builder origin(String v) { this.origin = v; return this; }
        public Builder destination(String v) { this.destination = v; return this; }
        public Builder date(LocalDate v) { this.date = v; return this; }
        public Builder requiredStop(String v) { this.requiredStop = v == null || v.trim().isEmpty() ? null : v.trim(); return this; }
        public Builder strategy(RankingStrategy v) { this.strategy = v; return this; }
        public Builder maxLegs(int v) { this.maxLegs = v; return this; }
        public Builder maxResults(int v) { this.maxResults = v; return this; }
        public Builder maxFare(int v) { this.maxFare = v; return this; }
        public Builder allowedModes(EnumSet<Mode> v) { this.allowedModes = v; return this; }
        public Builder departureWindow(DepartureWindow v) { this.departureWindow = v; return this; }

        public SearchRequest build() {
            if (origin == null || destination == null)
                throw new IllegalArgumentException("Please choose both a source and a destination.");
            if (origin.equals(destination))
                throw new IllegalArgumentException("Source and destination must be different.");
            if (date == null) throw new IllegalArgumentException("Please choose a valid travel date.");
            if (strategy == null)
                throw new IllegalArgumentException("Please choose how to rank the routes.");
            if (maxLegs < 1 || maxLegs > 5) throw new IllegalArgumentException("Maximum legs must be between 1 and 5.");
            if (maxFare < 0) throw new IllegalArgumentException("Budget cannot be negative.");
            return new SearchRequest(this);
        }
    }
}
