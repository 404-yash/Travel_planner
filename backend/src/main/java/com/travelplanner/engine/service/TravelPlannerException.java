package com.travelplanner.engine.service;

/** Base class of the planner's own checked exceptions (EXCEPTION HANDLING + inheritance). */
public class TravelPlannerException extends Exception {
    public TravelPlannerException(String message) { super(message); }
    public TravelPlannerException(String message, Throwable cause) { super(message, cause); }
}
