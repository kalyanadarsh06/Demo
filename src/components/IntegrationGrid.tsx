import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Lock, AlarmClock, Radio, Server, Cable, BrainCircuit, Cloud } from "lucide-react";

const items = [
  { icon: Camera, label: "CCTV / VMS" },
  { icon: Lock, label: "Access Control" },
  { icon: AlarmClock, label: "Alarms" },
  { icon: Radio, label: "MQTT / IoT" },
  { icon: Server, label: "Kafka Streams" },
  { icon: Cable, label: "gRPC / Legacy" },
  { icon: BrainCircuit, label: "YOLOv10 / CV" },
  { icon: Cloud, label: "FastAPI + OAuth2" },
];

const IntegrationGrid = () => {
  return (
    <section id="integrations" className="container max-w-6xl mx-auto py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold">Plug-and-Play Integrations</h2>
        <p className="mt-2 text-muted-foreground">Bring your stack as-is. We unify it.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map(({ icon: Icon, label }) => (
          <Card key={label} className="card-glass p-4 flex items-center gap-3">
            <Icon className="text-primary" />
            <div className="flex-1">
              <div className="font-medium">{label}</div>
              <Badge variant="secondary" className="mt-1">Auto-discovery</Badge>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default IntegrationGrid;
