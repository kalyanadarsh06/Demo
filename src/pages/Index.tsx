import { useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import IntegrationGrid from "@/components/IntegrationGrid";
import WorkflowBuilder, { type Step } from "@/components/WorkflowBuilder";
import EventStream, { type EventItem } from "@/components/EventStream";

const Index = () => {
  const [events, setEvents] = useState<EventItem[]>([]);

  const onRun = (steps: Step[]) => {
    const now = new Date();
    const mkTs = (i: number) => new Date(now.getTime() + i * 1000).toLocaleTimeString();
    const newEvents: EventItem[] = steps.map((s, i) => ({
      id: `${s.id}-${i}`,
      type: i === steps.length - 1 ? "critical" : i % 2 === 0 ? "info" : "warning",
      message: `${s.label} — step ${i + 1}`,
      ts: mkTs(i),
    }));
    setEvents((prev) => [...prev, ...newEvents]);
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SentinelOS — AI Physical Security Operations Platform",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    description: "Connect cameras, access control, alarms and IoT with AI automation to build security workflows in minutes.",
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <SiteHeader />
      <Hero />
      <section id="features" className="container max-w-6xl mx-auto py-12">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card-glass p-6">
            <h3 className="font-semibold mb-1">Computer Vision Ready</h3>
            <p className="text-sm text-muted-foreground">YOLOv10 for detection, tracking and alerts — plug in your camera feeds.</p>
          </div>
          <div className="card-glass p-6">
            <h3 className="font-semibold mb-1">Secure by Design</h3>
            <p className="text-sm text-muted-foreground">FastAPI + OAuth2, JWT and MFA-first access control.</p>
          </div>
          <div className="card-glass p-6">
            <h3 className="font-semibold mb-1">Real-time Streaming</h3>
            <p className="text-sm text-muted-foreground">Kafka events, WebSockets UI, MQTT for IoT, gRPC for legacy.</p>
          </div>
        </div>
      </section>
      <IntegrationGrid />
      <WorkflowBuilder onRun={onRun} />
      <EventStream events={events} />
    </main>
  );
};

export default Index;
