import { Card } from "@/components/ui/card";

export type EventItem = {
  id: string;
  type: "info" | "warning" | "critical";
  message: string;
  ts: string;
};

const colorByType: Record<EventItem["type"], string> = {
  info: "text-foreground",
  warning: "text-primary",
  critical: "text-destructive",
};

const EventStream = ({ events }: { events: EventItem[] }) => {
  return (
    <section id="demo" className="container max-w-6xl mx-auto py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold">Live Event Stream</h2>
        <p className="mt-2 text-muted-foreground">Simulated workflow execution output.</p>
      </div>
      <div className="grid gap-3">
        {events.length === 0 ? (
          <Card className="p-6 text-muted-foreground">No events yet. Build a workflow and press Run.</Card>
        ) : (
          events.map((e) => (
            <Card key={e.id} className="p-4 flex items-center justify-between">
              <div className={`font-medium ${colorByType[e.type]}`}>{e.message}</div>
              <div className="text-xs text-muted-foreground">{e.ts}</div>
            </Card>
          ))
        )}
      </div>
    </section>
  );
};

export default EventStream;
