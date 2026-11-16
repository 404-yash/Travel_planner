# JOURNEY — Object-Oriented Architecture & Interface Specifications

This document outlines the software engineering and Object-Oriented Design (OOD) architecture of the **JOURNEY** transit planner, detailing class hierarchies, design patterns, and interfaces for academic evaluation.

---

## 1. Design Patterns Implemented

| Pattern | Interface / Base | Concrete Implementations | Role & Architectural Purpose |
|---|---|---|---|
| **Strategy Pattern** | `RankingStrategy` | `CheapestStrategy`, `FastestStrategy`, `BalancedStrategy`, `FewestTransfersStrategy`, `WaitingTimeStrategy`, `LowestRiskStrategy`, `GreenestStrategy` | Encapsulates comparator logic for sorting graph routes based on multi-objective metrics without altering DFS traversal. |
| **Strategy / Adapter** | `PaymentGateway` | `MockPaymentGateway` | Standardizes payment transactions (UPI, Cards, Net Banking) and demo decline rules under a unified interface. |
| **Factory Pattern** | `LegFactory` | `BusLeg`, `TrainLeg`, `FlightLeg` | Decouples JSON/database parsing from polymorphic transit representation. |
| **Observer Pattern** | `DisruptionRegistry` | `DisruptionRegistry` (ConcurrentHashMap event bus) | Thread-safe observer tracking live delays, cancellations, and notifying the routing engine and listeners. |
| **Dynamic Policy** | `FarePolicy` | `FarePolicy` | Applies time-based and mode-specific dynamic pricing (weekend surcharges, peak flights, last-minute booking). |
| **Policy Pattern** | `RefundPolicy` | `RefundPolicy` | Encapsulates transparent refund tiers (90% for >=48h, 75% for 24-48h, 50% for 6-24h, 0% for <6h). |

---

## 2. Core Class & Interface Diagram (Mermaid)

```mermaid
classDiagram
    direction TB

    class RouteFinder {
        -Map~String, List~Leg~~ legsByOrigin
        -ThreadLocal~Integer~ notBefore
        -DisruptionRegistry disruptions
        +findAll(origin, destination, date, maxLegs, modes, window) List~Route~
        +findAll(origin, destination, date, maxLegs, modes, window, notBeforeMin) List~Route~
    }

    class RouteResolver {
        <<utility>>
        +resolve(finder, origin, destination, date, legIds) Optional~Route~
    }

    class TripMonitor {
        -RouteFinder finder
        -DisruptionRegistry disruptions
        +check(plannedLegs, tripStart) Report
    }

    class FareCalendar {
        -RouteFinder finder
        +build(origin, destination, from, days, maxLegs, modes) List~DayFare~
    }

    class PaymentGateway {
        <<interface>>
        +charge(method, amountRupees, payerRef, details) PaymentResult
    }

    class MockPaymentGateway {
        +charge(method, amountRupees, payerRef, details) PaymentResult
    }

    class RankingStrategy {
        <<interface>>
        +compare(Route r1, Route r2) int
    }

    PaymentGateway <|.. MockPaymentGateway
    RouteResolver ..> RouteFinder : uses
    TripMonitor ..> RouteFinder : re-plans via
    FareCalendar ..> RouteFinder : evaluates
```

---

## 3. Server-Side Trust & Anti-Tamper Security

In accordance with enterprise security principles, client-side fare data and timings are treated as untrusted:
1. **Route Resolution (`RouteResolver`)**: When a user books an itinerary, the browser sends only `legIds`. The server re-executes graph validation to ensure all legs connect, run on that specific calendar day, and are not disrupted.
2. **Server-Side Pricing (`FarePolicy`)**: The total fare is computed on the server by summing validated leg fares and pax multiplier.
3. **Disruption Concurrency (`DisruptionRegistry`)**: All cancellation and delay updates utilize `ConcurrentHashMap` and atomic operations to eliminate lost updates under high concurrency.
