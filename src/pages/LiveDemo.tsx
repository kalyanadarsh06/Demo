import SiteHeader from "@/components/SiteHeader";
import EventStream, { type EventItem } from "@/components/EventStream";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { useWorkflows, type Workflow } from "@/context/WorkflowsContext";

function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }

// Controlled demo sequence with exactly 10 events
let demoEventIndex = 0;
const demoEventSequence = [
  "Access card used - Main entrance (Badge #4521)",
  "Door unlock - Classroom 101", 
  { message: "Camera offline - Gym #3", type: "warning" },
  "Badge scan - Staff entrance (Badge #7832)",
  "Visitor buzz in - Main office",
  { 
    message: "Smoke detected - Cafeteria sensor #7", 
    type: "critical",
    location: "School Cafeteria",
    sensor: "Smoke Detector #7"
  },
  "Access card used - Library entrance (Badge #2341)",
  { message: "Door sensor fault - Classroom 205", type: "warning" },
  { 
    message: "Weapon detected - Camera #2 (Front entrance)", 
    type: "critical",
    location: "Front Entrance",
    sensor: "AI Camera #2"
  },
  "Badge scan - Administrative office (Badge #9876)"
];

function buildRealisticEvent() {
  if (demoEventIndex >= demoEventSequence.length) {
    // Demo complete - return null to stop generating events
    return null;
  }
  
  const event = demoEventSequence[demoEventIndex];
  demoEventIndex++;
  return event;
}

export default function LiveDemo() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [running, setRunning] = useState(true);

  // Static workflows for demo - only the two required workflows
  const active = useMemo(() => [
    { 
      id: "active-shooter-lockdown", 
      name: "Active Shooter Lockdown (K-12 School)", 
      steps: [
        { id: "1", label: "AI Vision Analysis", action: "Weapon Detection" },
        { id: "2", label: "Lockdown Command", action: "Lock All Doors" },
        { id: "3", label: "Emergency Alert", action: "Notify Police" },
        { id: "4", label: "Facility Broadcast", action: "PA Announcement" },
        { id: "5", label: "Emergency Alert", action: "Display Alert on Screens" }
      ], 
      triggers: [{ source: "camera-main-entrance", eventType: "weapon detected" }],
      source: "template" as const 
    },
    { 
      id: "fire-response-workflow", 
      name: "Emergency Fire Response Workflow", 
      steps: [
        { id: "1", label: "Fire Alarm Activation", action: "Sound Fire Alarm" },
        { id: "2", label: "Emergency Exit Unlock", action: "Unlock All Exit Doors" },
        { id: "3", label: "Evacuation Lighting Activation", action: "Activate Emergency Lighting" },
        { id: "4", label: "Emergency Services Notification", action: "Notify Fire Department" },
        { id: "5", label: "Facility Broadcast", action: "PA Evacuation Announcement" },
        { id: "6", label: "Compliance Audit Log", action: "Log Fire Response Event" }
      ], 
      triggers: [{ source: "fire-sensor-system", eventType: "fire detected" }],
      source: "template" as const 
    }
  ], []);

  const handleStart = () => {
    // Reset demo sequence when starting
    demoEventIndex = 0;
    setEvents([]); // Clear previous events
    setRunning(true);
  };

  const handleStop = () => {
    setRunning(false);
  };

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const eventData = buildRealisticEvent();
      
      // If no more events, stop the demo
      if (eventData === null) {
        setRunning(false);
        return;
      }
      
      let eventType = "info";
      let message = "";
      
      if (typeof eventData === "string") {
        // Normal event
        message = eventData;
        eventType = "info";
      } else {
        // Warning or critical event
        message = eventData.message;
        eventType = eventData.type;
      }
      
      const e: EventItem = {
        id: `${Date.now()}`,
        type: eventType as "info" | "warning" | "critical",
        message: message,
        ts: new Date().toLocaleTimeString(),
      };
      setEvents((prev) => [e, ...prev].slice(0, 100));
    }, 2500); // Slightly faster for better demo flow
    return () => clearInterval(t);
  }, [active, running]);

  return (
    <main>
      <SiteHeader />
      <section className="container max-w-6xl mx-auto py-12">
        <h1 className="text-3xl md:text-4xl font-bold">Live Demo</h1>
        <p className="mt-2 text-muted-foreground">Simulated streaming across cameras, doors, badge readers and sensors. Powered by AI vision, predictive health and automated reporting.</p>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => setRunning(true)} disabled={running}>Start</Button>
          <Button variant="outline" onClick={() => setRunning(false)} disabled={!running}>Pause</Button>
          <Button variant="secondary" onClick={() => setEvents([])}>Clear</Button>
        </div>
      </section>

      <section className="container max-w-6xl mx-auto py-4">
        <h2 className="text-xl font-semibold mb-3">Active Workflows</h2>
        {active.length === 0 ? (
          <Card className="p-4 text-muted-foreground">No active workflows. Activate a template or create one in Workflows.</Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {active.map((w) => (
              <Card key={w.id} className="p-4">
                <div className="font-medium">{w.name}</div>
                <div className="text-xs text-muted-foreground">{w.steps.length} steps</div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <EventStream events={events} />
    </main>
  );
}
