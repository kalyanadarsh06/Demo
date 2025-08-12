import { useState } from "react";
import { DndContext, DragEndEvent, useDraggable, useDroppable, DragOverlay, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkflows, type Step as ContextStep, type Workflow, type Template, type Trigger, type Location, type Schedule } from "@/context/WorkflowsContext";
import AIAssistant from "@/components/AIAssistant";
import { Plus, Trash2, Camera, Shield, AlertTriangle, Zap, Bell, Eye, Lock, Save, GripVertical, Radio, Users, Megaphone, DoorClosed, FileText, Clock, MapPin, Tag, Sparkles, LockIcon } from "lucide-react";

const PALETTE = [
  { id: "camera", label: "CCTV Motion Detection", icon: Camera, description: "Detects motion from security cameras" },
  { id: "ai-vision", label: "AI Vision Analysis", icon: Eye, description: "Object/weapon detection with zone mapping" },
  { id: "access-alert", label: "Access Control Alert", icon: Lock, description: "Unauthorized, forced, or door held open alerts" },
  { id: "badge-reader", label: "Badge Reader Event", icon: Radio, description: "Authorized entry, failed attempt, or RFID events" },
  { id: "visitor-mgmt", label: "Visitor Management Event", icon: Users, description: "Unscheduled visitor or VIP arrival notifications" },
  { id: "emergency-alert", label: "Emergency Alert", icon: AlertTriangle, description: "Fire, medical emergency, or panic button events" },
  { id: "alarm-system", label: "Alarm System", icon: Shield, description: "Intrusion, fire, or environmental alarms" },
  { id: "facility-broadcast", label: "Facility Broadcast", icon: Megaphone, description: "PA system, intercom, or SMS notifications" },
  { id: "lockdown-cmd", label: "Lockdown Command", icon: DoorClosed, description: "Lock doors/zones, flash lights, display signage" },
  { id: "compliance-audit", label: "Compliance Audit Event", icon: FileText, description: "Log all steps for after-action review" },
];

// Templates are now managed in WorkflowsContext with enhanced schema
// This component will use the templates from context

type SavedWorkflow = {
  id: string;
  name: string;
  description?: string;
  steps: Step[];
  triggers: Trigger[];
  isActive: boolean;
  location?: Location;
  schedule?: Schedule;
  complianceTags?: string[];
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

export type Step = { id: string; label: string; icon?: any; action: string; parameters?: object; device?: any; escalation?: any };

const WorkflowBuilder = ({ onRun }: { onRun: (steps: Step[]) => void }) => {
  const { templates, workflows, addWorkflow, activateTemplate, removeWorkflow } = useWorkflows();
  const [steps, setSteps] = useState<Step[]>([]);
  const [savedWorkflows, setSavedWorkflows] = useState<SavedWorkflow[]>([]);
  const [isPromptingName, setIsPromptingName] = useState(false);
  const [workflowName, setWorkflowName] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [activeTab, setActiveTab] = useState("builder");
  
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
          icon: item.icon,
          action: item.description // Use description as default action
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

  const loadTemplate = (template: Template) => {
    setSteps(template.steps);
    setActiveTab("builder"); // Switch to builder tab
  };

  const activateTemplateLocal = (template: Template) => {
    const workflow = activateTemplate(template.id);
    if (workflow) {
      const newWorkflow: SavedWorkflow = {
        id: workflow.id,
        name: workflow.name,
        description: workflow.description,
        steps: workflow.steps,
        triggers: workflow.triggers,
        isActive: true,
        complianceTags: workflow.complianceTags
      };
      setSavedWorkflows(prev => [...prev, newWorkflow]);
    }
  };

  const toggleWorkflow = (workflowId: string) => {
    setSavedWorkflows(prev => prev.map(w => 
      w.id === workflowId ? { ...w, isActive: !w.isActive } : w
    ));
  };

  const remove = (id: string) => setSteps(prev => prev.filter(s => s.id !== id));

  const saveWorkflow = () => {
    if (workflowName.trim()) {
      const workflow = addWorkflow(
        workflowName.trim(),
        steps,
        workflowDescription.trim() || undefined,
        [], // triggers - can be enhanced later
        undefined, // location - can be enhanced later
        undefined, // schedule - can be enhanced later
        [] // complianceTags - can be enhanced later
      );
      
      if (workflow) {
        const newWorkflow: SavedWorkflow = {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          steps: workflow.steps,
          triggers: workflow.triggers,
          isActive: true,
          complianceTags: workflow.complianceTags
        };
        setSavedWorkflows(prev => [...prev, newWorkflow]);
      }
      
      setSteps([]);
      setWorkflowName("");
      setWorkflowDescription("");
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
    setWorkflowDescription("");
  };

  return (
    <section id="workflows" className="container max-w-7xl mx-auto py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">Security Automation Workflows</h2>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">Build custom security workflows by dragging components, or start with pre-built templates designed by security experts.</p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Workflow Builder</TabsTrigger>
          <TabsTrigger value="templates">Pre-built Templates</TabsTrigger>
          <TabsTrigger value="ai-assistant" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Assistant
            <LockIcon className="w-3 h-3 opacity-50" />
          </TabsTrigger>
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
                {isPromptingName && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="p-6 w-full max-w-lg mx-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-semibold">Save Workflow</h3>
                          <p className="text-sm text-muted-foreground">Enter details for your custom workflow</p>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="workflow-name">Workflow Name *</Label>
                            <Input
                              id="workflow-name"
                              type="text"
                              value={workflowName}
                              onChange={(e) => setWorkflowName(e.target.value)}
                              placeholder="Enter workflow name..."
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && workflowName.trim()) saveWorkflow();
                                if (e.key === 'Escape') cancelSave();
                              }}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="workflow-description">Description (Optional)</Label>
                            <Input
                              id="workflow-description"
                              type="text"
                              value={workflowDescription}
                              onChange={(e) => setWorkflowDescription(e.target.value)}
                              placeholder="Brief description of workflow purpose..."
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="advanced-options"
                              checked={showAdvancedOptions}
                              onChange={(e) => setShowAdvancedOptions(e.target.checked)}
                              className="rounded"
                            />
                            <Label htmlFor="advanced-options" className="text-sm">Show advanced options</Label>
                          </div>
                          
                          {showAdvancedOptions && (
                            <div className="space-y-3 p-3 bg-muted/20 rounded-md">
                              <p className="text-xs text-muted-foreground">Advanced features like triggers, device mapping, schedules, and compliance tags will be available in future updates.</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={cancelSave} className="flex-1">
                            Cancel
                          </Button>
                          <Button onClick={saveWorkflow} className="flex-1" disabled={!workflowName.trim()}>
                            <Save className="w-4 h-4 mr-2" />
                            Save Workflow
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                )}
                {!isPromptingName && (
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
            <div className="mb-4">
              <Label htmlFor="sector-filter">Filter by Sector</Label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="All Sectors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Healthcare">Healthcare</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-4">
              {templates
                .filter(template => selectedSector === "all" || !selectedSector || template.sector === selectedSector)
                .map((template) => (
                <Card key={template.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{template.name}</h3>
                        <Badge variant="outline" className="text-xs">{template.sector}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                    
                    {template.triggers.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">TRIGGERS:</div>
                        <div className="flex flex-wrap gap-1">
                          {template.triggers.map((trigger, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Zap className="w-3 h-3 mr-1" />
                              {trigger.eventType}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-muted-foreground">WORKFLOW STEPS:</div>
                      <div className="flex flex-wrap gap-1">
                        {template.steps.map((step, index) => {
                          const Icon = step.icon || FileText;
                          return (
                            <Badge key={step.id} variant="secondary" className="text-xs">
                              <Icon className="w-3 h-3 mr-1" />
                              {step.label}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                    
                    {template.complianceTags.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-medium text-muted-foreground">COMPLIANCE:</div>
                        <div className="flex flex-wrap gap-1">
                          {template.complianceTags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => loadTemplate(template)}
                        className="flex-1"
                      >
                        Load to Builder
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => activateTemplateLocal(template)}
                        className="flex-1"
                      >
                        Activate Now
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="ai-assistant" className="space-y-6">
          <AIAssistant onWorkflowGenerated={(workflow) => {
            // Add the AI-generated workflow to saved workflows
            const newWorkflow: SavedWorkflow = {
              id: workflow.id,
              name: workflow.name,
              description: workflow.description,
              steps: workflow.steps,
              triggers: workflow.triggers,
              isActive: false, // Start as inactive for review
              complianceTags: workflow.complianceTags
            };
            setSavedWorkflows(prev => [...prev, newWorkflow]);
          }} />
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
