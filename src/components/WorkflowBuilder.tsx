import { useState } from "react";
import { DndContext, DragEndEvent, useDraggable, useDroppable, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Camera, Shield, AlertTriangle, Zap, Bell, Eye, Lock, Save, GripVertical } from "lucide-react";

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
  },
  {
    id: "night-security",
    name: "Night Security Protocol",
    description: "Automated night-time security monitoring and response",
    steps: [
      { id: "camera-4", label: "CCTV Motion Detection", icon: Camera },
      { id: "yolo-4", label: "AI Vision Analysis", icon: Eye },
      { id: "notify-3", label: "Security Alert", icon: Bell },
      { id: "escalate-3", label: "Emergency Response", icon: AlertTriangle }
    ]
  },
  {
    id: "breach-response",
    name: "Perimeter Breach Response",
    description: "Immediate response protocol for perimeter breaches",
    steps: [
      { id: "camera-5", label: "CCTV Motion Detection", icon: Camera },
      { id: "yolo-5", label: "AI Vision Analysis", icon: Eye },
      { id: "alarm-3", label: "Alarm System", icon: Shield },
      { id: "notify-4", label: "Security Alert", icon: Bell },
      { id: "escalate-4", label: "Emergency Response", icon: AlertTriangle }
    ]
  },
  {
    id: "fire-safety",
    name: "Fire Safety Integration",
    description: "Integrated fire detection and emergency response",
    steps: [
      { id: "alarm-4", label: "Alarm System", icon: Shield },
      { id: "notify-5", label: "Security Alert", icon: Bell },
      { id: "escalate-5", label: "Emergency Response", icon: AlertTriangle }
    ]
  },
  {
    id: "visitor-management",
    name: "Visitor Management",
    description: "Automated visitor tracking and access control",
    steps: [
      { id: "access-2", label: "Access Control Alert", icon: Lock },
      { id: "camera-6", label: "CCTV Motion Detection", icon: Camera },
      { id: "yolo-6", label: "AI Vision Analysis", icon: Eye },
      { id: "notify-6", label: "Security Alert", icon: Bell }
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
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={`card-glass p-4 cursor-grab active:cursor-grabbing hover:scale-105 transition-all duration-200 ${isDragging ? "opacity-80 scale-105 shadow-lg" : ""}`}>
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

function SortableStep({ step, index, onRemove }: { step: Step; index: number; onRemove: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = step.icon || Plus;

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className={`p-4 hover:shadow-md transition-all duration-200 ${isDragging ? "opacity-50 shadow-lg scale-105" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <span className="text-sm font-medium text-primary">{index + 1}</span>
          </div>
          <Icon className="text-primary w-5 h-5" />
          <span className="font-medium">{step.label}</span>
        </div>
        <div className="flex items-center gap-2">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded transition-colors"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          <Button variant="ghost" size="icon" aria-label={`Remove ${step.label}`} onClick={() => onRemove(step.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function Canvas({ children }: { children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({ id: "canvas" });
  return (
    <div ref={setNodeRef} className={`min-h-48 rounded-lg border-2 border-dashed p-6 transition-all duration-200 ${
      isOver ? "bg-primary/5 border-primary" : "bg-muted/20 border-muted-foreground/20"
    }`}>
      {children}
    </div>
  );
}

export type Step = { id: string; label: string; icon?: any };

const WorkflowBuilder = ({ onRun }: { onRun: (steps: Step[]) => void }) => {
  const [steps, setSteps] = useState<Step[]>([]);
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>([]);
  const [isPromptingName, setIsPromptingName] = useState(false);
  const [workflowName, setWorkflowName] = useState("");
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    
    // Adding new component from palette to canvas
    if (over?.id === "canvas") {
      const item = PALETTE.find(p => p.id === active.id);
      if (item) {
        setSteps(prev => [...prev, { 
          id: `${item.id}-${Date.now()}`, 
          label: item.label, 
          icon: item.icon 
        }]);
      }
      return;
    }
    
    // Reordering steps within canvas
    const activeIndex = steps.findIndex(step => step.id === active.id);
    const overIndex = steps.findIndex(step => step.id === over?.id);
    
    if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
      setSteps(prev => arrayMove(prev, activeIndex, overIndex));
    }
  };

  const loadTemplate = (template: typeof TEMPLATES[0]) => {
    setSteps(template.steps);
  };

  const activateTemplate = (template: typeof TEMPLATES[0]) => {
    const newWorkflow: SavedWorkflow = {
      id: `activated-${Date.now()}`,
      name: template.name,
      steps: template.steps,
      isActive: true
    };
    setSavedWorkflows(prev => [...prev, newWorkflow]);
  };

  const toggleWorkflow = (workflowId: string) => {
    setSavedWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, isActive: !w.isActive } : w
    ));
  };

  const remove = (id: string) => setSteps(prev => prev.filter(s => s.id !== id));

  const saveWorkflow = () => {
    if (workflowName.trim()) {
      const newWorkflow: SavedWorkflow = {
        id: `custom-${Date.now()}`,
        name: workflowName.trim(),
        steps: steps,
        isActive: true
      };
      setSavedWorkflows(prev => [...prev, newWorkflow]);
      setSteps([]);
      setWorkflowName("");
      setIsPromptingName(false);
    }
  };

  const handleSaveClick = () => {
    if (steps.length === 0) return;
    setIsPromptingName(true);
  };

  const cancelSave = () => {
    setIsPromptingName(false);
    setWorkflowName("");
  };

  return (
    <section id="workflows" className="container max-w-7xl mx-auto py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">Security Automation Workflows</h2>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">Build custom security workflows by dragging components, or start with pre-built templates designed by security experts.</p>
      </div>
      
      <Tabs defaultValue="builder" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="builder">Workflow Builder</TabsTrigger>
          <TabsTrigger value="templates">Pre-built Templates</TabsTrigger>
        </TabsList>
        
        <TabsContent value="builder">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
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
                  <Canvas>
                    {steps.length === 0 ? (
                      <div className="text-center py-12">
                        <Zap className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
                        <div className="text-muted-foreground font-medium">Drag security components here to build your workflow</div>
                        <div className="text-sm text-muted-foreground mt-2">Or load a pre-built template from the Templates tab</div>
                      </div>
                    ) : (
                      <SortableContext items={steps.map(s => s.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-3">
                          {steps.map((step, index) => (
                            <SortableStep 
                              key={step.id} 
                              step={step} 
                              index={index} 
                              onRemove={remove}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    )}
                  </Canvas>
                </div>
                {isPromptingName ? (
                  <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Workflow Name</label>
                      <input 
                        type="text"
                        value={workflowName}
                        onChange={(e) => setWorkflowName(e.target.value)}
                        placeholder="Enter workflow name..."
                        className="w-full px-3 py-2 border rounded-md bg-background"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveWorkflow();
                          if (e.key === 'Escape') cancelSave();
                        }}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={saveWorkflow} disabled={!workflowName.trim()} className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90">
                        <Save className="w-4 h-4 mr-2" /> Save Workflow
                      </Button>
                      <Button variant="outline" onClick={cancelSave}>Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-between items-center">
                    <Button variant="outline" onClick={() => setSteps([])} disabled={steps.length === 0}>Clear Canvas</Button>
                    <Button 
                      onClick={handleSaveClick} 
                      className="gap-2 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90" 
                      disabled={steps.length === 0}
                    >
                      <Save className="w-4 h-4" /> Save Workflow
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </DndContext>
        </TabsContent>
        
        <TabsContent value="templates">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold">Pre-built Security Templates</h3>
              <p className="text-muted-foreground mt-2">Professional security workflows designed by experts. Activate templates to add them to your saved workflows.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEMPLATES.map(template => {
                const isActivated = savedWorkflows.some(w => w.name === template.name);
                return (
                  <Card key={template.id} className={`p-6 hover:shadow-lg transition-all duration-300 hover:scale-105 ${
                    isActivated ? 'border-primary bg-primary/5' : 'border-border'
                  }`}>
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold">{template.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                        </div>
                        {isActivated && (
                          <Badge variant="default" className="text-xs">Active</Badge>
                        )}
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
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => loadTemplate(template)} 
                          className="flex-1 gap-2 hover:scale-105 transition-all duration-200"
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="w-4 h-4" /> Load to Canvas
                        </Button>
                        <Button 
                          onClick={() => activateTemplate(template)} 
                          className={`gap-2 hover:scale-105 transition-all duration-200 ${
                            isActivated ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          variant={isActivated ? "secondary" : "default"}
                          size="sm"
                          disabled={isActivated}
                        >
                          <Zap className="w-4 h-4" /> {isActivated ? 'Activated' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Saved Workflows Section - Moved to bottom */}
      <div className="mt-16 space-y-6">
        <div className="text-center">
          <h3 className="text-2xl font-bold">Saved Security Workflows</h3>
          <p className="text-muted-foreground mt-2">Manage your activated workflows and toggle their status</p>
        </div>
        {savedWorkflows.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="mx-auto w-12 h-12 text-muted-foreground mb-4" />
            <div className="text-muted-foreground">No workflows activated yet</div>
            <div className="text-sm text-muted-foreground mt-2">Activate templates from the Pre-built Templates tab to see them here</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      variant="destructive" 
                      size="sm"
                      onClick={() => setSavedWorkflows(prev => prev.filter(w => w.id !== workflow.id))}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" /> Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default WorkflowBuilder;
