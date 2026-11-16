package com.travelplanner.engine.service;

public class DataLoadException extends TravelPlannerException {
    public DataLoadException(String message) { super(message); }
    public DataLoadException(String message, Throwable cause) { super(message, cause); }
}
