import React from 'react';
import { Layers, ShieldCheck, Zap, BookOpen, Code2, Server, Globe2, Compass } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8 text-slate-800">
      <div>
        <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
          University Software Engineering & OOP Project
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">
          JOURNEY — System Architecture & Design
        </h1>
        <p className="text-sm text-slate-500 mt-2">
          An enterprise-grade, offline-first multi-modal transit planning platform built with modern Object-Oriented Principles.
        </p>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <Server className="w-6 h-6 text-brand-600" />
          <h3 className="font-bold text-sm text-slate-900">Backend Core</h3>
          <p className="text-xs text-slate-500">
            Java 21 + Spring Boot 3.3.4, Spring Security, JWT authentication, H2 in-memory DB, OpenPDF + ZXing QR code generator.
          </p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <Globe2 className="w-6 h-6 text-blue-600" />
          <h3 className="font-bold text-sm text-slate-900">Frontend UI</h3>
          <p className="text-xs text-slate-500">
            React 18, TypeScript, Tailwind CSS, Leaflet.js OpenStreetMap routing visualizer, offline-capable architecture.
          </p>
        </div>
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <Compass className="w-6 h-6 text-emerald-600" />
          <h3 className="font-bold text-sm text-slate-900">Transit Engine</h3>
          <p className="text-xs text-slate-500">
            DFS multi-modal graph search (&lt; 2 ms latency), sub-journey re-planning, connection risk evaluation, CO₂ estimation.
          </p>
        </div>
      </div>

      {/* Object-Oriented Design Patterns */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-brand-600" />
          <h2 className="text-lg font-bold text-slate-900">Implemented OOP Design Patterns</h2>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1">1. Strategy Pattern (`RankingStrategy`)</h4>
            <p className="text-slate-600">
              Encapsulates 7 distinct comparator strategies (<code>CheapestStrategy</code>, <code>FastestStrategy</code>, <code>BalancedStrategy</code>, <code>FewestTransfersStrategy</code>, <code>WaitingTimeStrategy</code>, <code>LowestRiskStrategy</code>, <code>GreenestStrategy</code>). Clients switch ranking algorithms dynamically without modifying graph discovery.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1">2. Factory Pattern (`LegFactory`)</h4>
            <p className="text-slate-600">
              Instantiates polymorphic subclasses (<code>BusLeg</code>, <code>TrainLeg</code>, <code>FlightLeg</code>) from raw dataset definitions, decoupling transit parsing from domain representation.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1">3. Observer Pattern (`DisruptionRegistry`)</h4>
            <p className="text-slate-600">
              Allows transit controllers and listeners to observe cancellations and schedule delays. Uses concurrent data structures for thread-safe event publishing under high concurrency.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1">4. Adapter Pattern (`PaymentGateway` &amp; `MockPaymentGateway`)</h4>
            <p className="text-slate-600">
              Standardizes third-party payment authorizations (UPI, Card, Net Banking) under a unified interface, isolating payment workflows from booking entity persistence.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1">5. Dynamic Pricing Policy (`FarePolicy`)</h4>
            <p className="text-slate-600">
              Calculates realistic surge pricing, peak weekend surcharges, and advance-purchase discounts on top of static schedules.
            </p>
          </div>
        </div>
      </section>

      {/* Dataset & Offline Reliability */}
      <section className="bg-slate-50 rounded-3xl p-6 border border-slate-200 text-xs space-y-2">
        <h3 className="font-bold text-slate-900 text-sm">Offline-First &amp; Zero External API Keys</h3>
        <p className="text-slate-600">
          The entire platform runs fully self-contained without requiring external API keys or commercial services. It includes 16 Indian metropolitan transit nodes, 245 realistic multi-modal legs, and complete timetable coordinates.
        </p>
      </section>
    </div>
  );
};
