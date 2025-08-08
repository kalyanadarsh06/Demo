import { useState } from "react";
import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Plus, Trash2 } from "lucide-react";

const PALETTE = [
  { id: "camera", label: "CCTV Event" },
  { id: "access", label: "Door Forced" },
  { id: "yolo", label: "YOLOv10 Detect" },
  { id: "notify", label: "Notify Guard" },
  { id: "escalate", label: "Call Authority" },
];

function Draggable({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`card-glass p-3 cursor-grab active:cursor-grabbing ${isDragging ? "opacity-80" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="font-medium">{label}</span>
        <Badge variant="secondary">Drag</Badge>
      </div>
    </div>
  );
}

function Canvas({ onDrop, children }: { onDrop: (id: string) => void; children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: "canvas" });
  return (
    <div ref={setNodeRef} className={`min-h-48 rounded-lg border p-4 ${isOver ? "bg-accent" : "bg-background"}`}>
      {children}
    </div>
  );
}

export type Step = { id: string; label: string };

const WorkflowBuilder = ({ onRun }: { onRun: (steps: Step[]) => void }) => {
  const [steps, setSteps] = useState<Step[]>([]);

  const onDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    if (over?.id === "canvas") {
      const item = PALETTE.find(p => p.id === active.id);
      if (item) setSteps(prev => [...prev, { id: `${item.id}-${prev.length + 1}`, label: item.label }]);
    }
  };

  const remove = (id: string) => setSteps(prev => prev.filter(s => s.id !== id));

  const run = () => onRun(steps);

  return (
    <section id="workflows" className="container max-w-6xl mx-auto py-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold">Visual Workflow Builder</h2>
        <p className="mt-2 text-muted-foreground">Drag steps onto the canvas. Press run to simulate.</p>
      </div>
      <DndContext onDragEnd={onDragEnd}>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-3">
            {PALETTE.map(p => (
              <Draggable key={p.id} id={p.id} label={p.label} />
            ))}
          </div>
          <div className="md:col-span-2 space-y-4">
            <Canvas onDrop={(id) => {}}>
              {steps.length === 0 ? (
                <div className="text-muted-foreground text-sm">Drop steps here…</div>
              ) : (
                <div className="space-y-3">
                  {steps.map(s => (
                    <Card key={s.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Plus className="text-primary" />
                        <span className="font-medium">{s.label}</span>
                      </div>
                      <Button variant="ghost" size="icon" aria-label={`Remove ${s.label}`} onClick={() => remove(s.id)}>
                        <Trash2 />
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </Canvas>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSteps([])}>Clear</Button>
              <Button variant="hero" onClick={run} className="gap-2"><Play /> Run</Button>
            </div>
          </div>
        </div>
      </DndContext>
    </section>
  );
};

export default WorkflowBuilder;
