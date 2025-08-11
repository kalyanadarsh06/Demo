import { useState } from "react";
import { DndContext, DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Plus, Trash2, Camera, Shield, AlertTriangle, Zap, Bell, Eye, Lock } from "lucide-react";

const PALETTE = [
  { id: "camera", label: "CCTV Motion Detection", icon: Camera, description: "Detects motion from security cameras" },
  { id: "access", label: "Access Control Alert", icon: Lock, description: "Monitors door access and unauthorized entry" },
  { id: "yolo", label: "AI Vision Analysis", icon: Eye, description: "YOLOv10 object detection and classification" },
  { id: "notify", label: "Security Alert", icon: Bell, description: "Sends notifications to security personnel" },
  { id: "escalate", label: "Emergency Response", icon: AlertTriangle, description: "Escalates to authorities or emergency services" },
  { id: "alarm", label: "Alarm System", icon: Shield, description: "Triggers building alarm systems" },
];

const TEMPLATES = [
  {
    id: "intrusion-detection",
    name: "Intrusion Detection",
    description: "Comprehensive perimeter security with AI analysis",
    steps: [
      { id: "camera-1", label: "CCTV Motion Detection", icon: Camera },
      { id: "yolo-1", label: "AI Vision Analysis", icon: Eye },
      { id: "notify-1", label: "Security Alert", icon: Bell },
      { id: "escalate-1", label: "Emergency Response", icon: AlertTriangle }
    ]
  },
  {
    id: "access-monitoring",
    name: "Access Control Monitoring",
    description: "Monitor and respond to unauthorized access attempts",
    steps: [
      { id: "access-1", label: "Access Control Alert", icon: Lock },
      { id: "camera-2", label: "CCTV Motion Detection", icon: Camera },
      { id: "yolo-2", label: "AI Vision Analysis", icon: Eye },
      { id: "alarm-1", label: "Alarm System", icon: Shield }
    ]
  },
  {
    id: "perimeter-security",
    name: "Perimeter Security",
    description: "24/7 automated perimeter monitoring and response",
    steps: [
      { id: "camera-3", label: "CCTV Motion Detection", icon: Camera },
      { id: "yolo-3", label: "AI Vision Analysis", icon: Eye },
      { id: "notify-2", label: "Security Alert", icon: Bell },
      { id: "alarm-2", label: "Alarm System", icon: Shield },
      { id: "escalate-2", label: "Emergency Response", icon: AlertTriangle }
    ]
  }
];

type SavedWorkflow = {
  id: string;
  name: string;
  steps: Step[];
  isActive: boolean;
};

function Draggable({ id, label, icon: Icon, description }: { id: string; label: string; icon: any; description: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`card-glass p-4 cursor-grab active:cursor-grabbing hover:scale-105 transition-all duration-200 ${isDragging ? "opacity-80 scale-105" : ""}`}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon className="text-primary w-4 h-4" />
          <span className="font-medium text-sm">{label}</span>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
        <Badge variant="secondary" className="text-xs">Drag to Canvas</Badge>
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

export type Step = { id: string; label: string; icon?: any };

const WorkflowBuilder = ({ onRun }: { onRun: (steps: Step[]) => void }) => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>([
    {
      id: "saved-1",
      name: "Night Security Protocol",
      steps: [
        { id: "camera-saved-1", label: "CCTV Motion Detection", icon: Camera },
        { id: "yolo-saved-1", label: "AI Vision Analysis", icon: Eye },
        { id: "notify-saved-1", label: "Security Alert", icon: Bell },
        { id: "escalate-saved-1", label: "Emergency Response", icon: AlertTriangle }
      ],
      isActive: true
    },
    {
      id: "saved-2",
      name: "Access Control Monitor",
      steps: [
        { id: "access-saved-1", label: "Access Control Alert", icon: Lock },
        { id: "camera-saved-2", label: "CCTV Motion Detection", icon: Camera },
        { id: "alarm-saved-1", label: "Alarm System", icon: Shield }
      ],
      isActive: false
    },
    {
      id: "saved-3",
      name: "Perimeter Breach Response",
      steps: [
        { id: "camera-saved-3", label: "CCTV Motion Detection", icon: Camera },
        { id: "yolo-saved-2", label: "AI Vision Analysis", icon: Eye },
        { id: "alarm-saved-2", label: "Alarm System", icon: Shield },
        { id: "notify-saved-2", label: "Security Alert", icon: Bell },
        { id: "escalate-saved-2", label: "Emergency Response", icon: AlertTriangle }
      ],
      isActive: true
    },
    {
      id: "saved-4",
      name: "Fire Safety Integration",
      steps: [
        { id: "alarm-saved-3", label: "Alarm System", icon: Shield },
        { id: "notify-saved-3", label: "Security Alert", icon: Bell },
        { id: "escalate-saved-3", label: "Emergency Response", icon: AlertTriangle }
      ],
      isActive: false
    },
    {
      id: "saved-5",
      name: "Visitor Management",
      steps: [
        { id: "access-saved-2", label: "Access Control Alert", icon: Lock },
        { id: "camera-saved-4", label: "CCTV Motion Detection", icon: Camera },
        { id: "yolo-saved-3", label: "AI Vision Analysis", icon: Eye },
        { id: "notify-saved-4", label: "Security Alert", icon: Bell }
      ],
      isActive: true
    }
  ]);

  const onDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    if (over?.id === "canvas") {
      const item = PALETTE.find(p => p.id === active.id);
      if (item) setSteps(prev => [...prev, { id: `${item.id}-${prev.length + 1}`, label: item.label, icon: item.icon }]);
    }
  };

  const loadTemplate = (template: typeof TEMPLATES[0]) => {
    setSteps(template.steps);
  };

  const toggleWorkflow = (workflowId: string) => {
    setSavedWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, isActive: !w.isActive } : w
    ));
  };

  const remove = (id: string) => setSteps(prev => prev.filter(s => s.id !== id));

  const run = () => onRun(steps);

  return (
    <section id="workflows" className="container max-w-7xl mx-auto py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">Security Automation Workflows</h2>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">Build custom security workflows by dragging components, or start with pre-built templates designed by security experts.</p>
      </div>
      
      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="builder">Workflow Builder</TabsTrigger>
          <TabsTrigger value="templates">Pre-built Templates</TabsTrigger>
          <TabsTrigger value="saved">Saved Workflows</TabsTrigger>
        </TabsList>
        
        <TabsContent value="builder">
          <DndContext onDragEnd={onDragEnd}>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-4">
                <h3 className="text-lg font-semibold mb-4">Security Components</h3>
                {PALETTE.map(p => (
                  <Draggable key={p.id} id={p.id} label={p.label} icon={p.icon} description={p.description} />
                ))}
              </div>
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Workflow Canvas</h3>
                  <Canvas onDrop={(id) => {}}>
                    {steps.length === 0 ? (
                      <div className="text-center py-12">
                        <Zap className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
                        <div className="text-muted-foreground">Drag security components here to build your workflow</div>
                        <div className="text-sm text-muted-foreground mt-2">Or load a pre-built template from the Templates tab</div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {steps.map((s, index) => {
                          const Icon = s.icon || Plus;
                          return (
                            <Card key={s.id} className="p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                                    <span className="text-sm font-medium text-primary">{index + 1}</span>
                                  </div>
                                  <Icon className="text-primary w-5 h-5" />
                                  <span className="font-medium">{s.label}</span>
                                </div>
                                <Button variant="ghost" size="icon" aria-label={`Remove ${s.label}`} onClick={() => remove(s.id)}>
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </Canvas>
                </div>
                <div className="flex justify-between items-center">
                  <Button variant="outline" onClick={() => setSteps([])} disabled={steps.length === 0}>Clear Canvas</Button>
                  <div className="flex gap-3">
                    <Button variant="outline" disabled={steps.length === 0}>Save Workflow</Button>
                    <Button variant="hero" onClick={run} className="gap-2" disabled={steps.length === 0}>
                      <Play className="w-4 h-4" /> Run Simulation
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DndContext>
        </TabsContent>
        
        <TabsContent value="templates">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEMPLATES.map(template => (
              <Card key={template.id} className="p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-muted-foreground">Workflow Steps:</div>
                    {template.steps.map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <div key={step.id} className="flex items-center gap-2 text-sm">
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                            <span className="text-xs font-medium text-primary">{index + 1}</span>
                          </div>
                          <Icon className="w-4 h-4 text-primary" />
                          <span>{step.label}</span>
                        </div>
                      );
                    })}
                  </div>
                  <Button 
                    onClick={() => loadTemplate(template)} 
                    className="w-full gap-2 hover:scale-105 transition-all duration-200"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4" /> Load Template
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="saved">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold">Saved Security Workflows</h3>
              <p className="text-muted-foreground mt-2">Manage your saved workflows and toggle their activation status</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {savedWorkflows.map(workflow => (
                <Card key={workflow.id} className={`p-6 transition-all duration-300 hover:shadow-lg ${
                  workflow.isActive ? 'border-primary bg-primary/5' : 'border-border'
                }`}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold">{workflow.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          workflow.isActive ? 'text-primary' : 'text-muted-foreground'
                        }`}>
                          {workflow.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <Switch 
                          checked={workflow.isActive}
                          onCheckedChange={() => toggleWorkflow(workflow.id)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      {workflow.steps.map((step, index) => {
                        const Icon = step.icon || Plus;
                        return (
                          <div key={step.id} className="flex items-center gap-2 text-sm">
                            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10">
                              <span className="text-xs font-medium text-primary">{index + 1}</span>
                            </div>
                            <Icon className="w-4 h-4 text-primary" />
                            <span>{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSteps(workflow.steps)}
                        className="flex-1"
                      >
                        Load to Canvas
                      </Button>
                      <Button 
                        variant={workflow.isActive ? "default" : "secondary"} 
                        size="sm"
                        onClick={() => toggleWorkflow(workflow.id)}
                        className="gap-2"
                      >
                        {workflow.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  );
};

export default WorkflowBuilder;
