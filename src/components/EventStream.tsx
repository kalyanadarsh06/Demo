import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Info, Clock } from "lucide-react";

export type EventItem = {
  id: string;
  type: "info" | "warning" | "critical";
  message: string;
  ts: string;
  source?: string;
  details?: string;
};

const eventConfig: Record<EventItem["type"], { color: string; icon: any; bgColor: string }> = {
  info: { color: "text-blue-600", icon: Info, bgColor: "bg-blue-50 border-blue-200" },
  warning: { color: "text-amber-600", icon: AlertCircle, bgColor: "bg-amber-50 border-amber-200" },
  critical: { color: "text-red-600", icon: AlertCircle, bgColor: "bg-red-50 border-red-200" },
};

const EventStream = ({ events }: { events: EventItem[] }) => {
  return (
    <section id="demo" className="container max-w-6xl mx-auto py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold">Live Security Event Stream</h2>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          Real-time monitoring of your security workflow executions. See how your automated responses trigger in sequence.
        </p>
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {events.length === 0 ? (
          <Card className="p-8 text-center">
            <Clock className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
            <div className="text-muted-foreground text-lg font-medium">Waiting for workflow execution...</div>
            <div className="text-sm text-muted-foreground mt-2">
              Build a security workflow above and press "Run Simulation" to see events appear here
            </div>
          </Card>
        ) : (
          events.map((e, index) => {
            const config = eventConfig[e.type];
            const Icon = config.icon;
            return (
              <Card key={e.id} className={`p-4 ${config.bgColor} border-l-4 animate-fade-in-up`} style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${config.bgColor}`}>
                      <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div className="space-y-1">
                      <div className={`font-medium ${config.color}`}>{e.message}</div>
                      <Badge variant={e.type === 'critical' ? 'destructive' : e.type === 'warning' ? 'default' : 'secondary'} className="text-xs">
                        {e.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">{e.ts}</div>
                </div>
              </Card>
            );
          })
        )}
      </div>
      {events.length > 0 && (
        <div className="text-center mt-6">
          <Badge variant="outline" className="text-sm">
            {events.length} event{events.length !== 1 ? 's' : ''} processed
          </Badge>
        </div>
      )}
    </section>
  );
};

export default EventStream;
