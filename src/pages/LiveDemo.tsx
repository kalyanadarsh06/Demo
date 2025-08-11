import SiteHeader from "@/components/SiteHeader";
import EventStream, { type EventItem } from "@/components/EventStream";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { useWorkflows, type Workflow } from "@/context/WorkflowsContext";

function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }

function buildMessage(wf: Workflow) {
  const devices = [
    { type: "Camera", events: ["Object: person", "Object: vehicle", "No motion", "Tamper detected", "Blur detected"] },
    { type: "Door Lock", events: ["Forced open", "Held open", "Lock engaged", "Access granted", "Access denied"] },
    { type: "Badge Reader", events: ["Badge read", "Unknown badge", "Cloned badge suspected", "Two-factor required"] },
    { type: "Sensor", events: ["Glass break", "Vibration spike", "Perimeter fence", "Smoke detected"] },
  ];
  const vis = ["YOLOv10: person without badge", "YOLOv10: bag left unattended", "Pattern: repeated after-hours access", "Tracking: subject across 3 cameras"];
  const health = ["Camera 12 predicted failure (bearing noise)", "Door controller latency spike", "Badge reader offline recovered", "Storage at 85% capacity"];
  const reports = ["Incident auto-created #" + Math.floor(Math.random()*900+100), "Report dispatched to SOC", "Evidence package compiled"];

  const bucket = pick(["device", "vision", "health", "report"]);
  let detail = "";
  if (bucket === "device") {
    const d = pick(devices);
    detail = `${d.type}: ${pick(d.events)}`;
  } else if (bucket === "vision") {
    detail = pick(vis);
  } else if (bucket === "health") {
    detail = `Health: ${pick(health)}`;
  } else {
    detail = pick(reports);
  }
  return `${wf.name} — ${detail}`;
}

export default function LiveDemo() {
  const { workflows } = useWorkflows();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [running, setRunning] = useState(true);

  const active = useMemo(() => (workflows.length ? workflows : [{ id: "ad-hoc", name: "Ad‑hoc Monitoring", steps: [], source: "template" as const }]), [workflows]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      const wf = pick(active);
      const e: EventItem = {
        id: `${Date.now()}`,
        type: Math.random() > 0.9 ? "critical" : Math.random() > 0.6 ? "warning" : "info",
        message: buildMessage(wf),
        ts: new Date().toLocaleTimeString(),
      };
      setEvents((prev) => [e, ...prev].slice(0, 100));
    }, 1200);
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
