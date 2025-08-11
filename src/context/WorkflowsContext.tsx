import { createContext, useContext, useEffect, useMemo, useState } from "react";

// Enhanced data structures for improved security workflow automation
export type DeviceRef = {
  id: string;
  type: string;
  location: Location;
};

export type Trigger = {
  source: string;
  eventType: string;
  parameters?: object;
};

export type Location = {
  building: string;
  floor: string;
  room: string;
};

export type Schedule = {
  start: string;
  end: string;
  days: ("M"|"T"|"W"|"Th"|"F"|"Sa"|"Su")[];
};

export type EscalationRef = {
  type: "Local" | "Police" | "Facilities" | "Fire";
  contact: string;
};

export type Step = {
  id: string;
  label: string;
  icon?: any;
  device?: DeviceRef;
  action: string;
  parameters?: object;
  escalation?: EscalationRef;
};

export type Workflow = {
  id: string;
  name: string;
  description?: string;
  steps: Step[];
  triggers: Trigger[];
  source: "custom" | "template";
  location?: Location;
  schedule?: Schedule;
  complianceTags?: string[];
};

export type Template = {
  id: string;
  name: string;
  description: string;
  sector: "Education" | "Healthcare" | "Commercial" | "Retail";
  steps: Step[];
  triggers: Trigger[];
  recommendedDevices: DeviceRef[];
  complianceTags: string[];
};

type Ctx = {
  workflows: Workflow[];
  templates: Template[];
  addWorkflow: (name: string, steps: Step[], description?: string, triggers?: Trigger[], location?: Location, schedule?: Schedule, complianceTags?: string[]) => Workflow | undefined;
  activateTemplate: (id: string) => Workflow | undefined;
  removeWorkflow: (id: string) => void;
  clearWorkflows: () => void;
};

const defaultTemplates: Template[] = [
  {
    id: "tmpl-active-shooter",
    name: "Active Shooter Lockdown (K-12 School)",
    description: "Immediate lockdown protocol for weapon detection at school entrance.",
    sector: "Education",
    steps: [
      { id: "weapon-detect", label: "AI Vision Analysis", action: "Weapon Detection", parameters: { confidence: 0.95 } },
      { id: "lockdown-doors", label: "Lockdown Command", action: "Lock All Doors", device: { id: "access-system-1", type: "access control", location: { building: "Main", floor: "All", room: "All" } } },
      { id: "police-alert", label: "Emergency Alert", action: "Notify Police", escalation: { type: "Police", contact: "911" } },
      { id: "pa-broadcast", label: "Facility Broadcast", action: "PA Announcement", parameters: { message: "Lockdown in effect" } },
      { id: "display-alert", label: "Emergency Alert", action: "Display Alert on Screens" }
    ],
    triggers: [{ source: "camera-main-entrance", eventType: "weapon detected" }],
    recommendedDevices: [
      { id: "camera-main-entrance", type: "AI camera", location: { building: "Main", floor: "1", room: "Entrance" } },
      { id: "access-system-1", type: "access control", location: { building: "Main", floor: "All", room: "All" } }
    ],
    complianceTags: ["FERPA", "School Safety"]
  },
  {
    id: "tmpl-infant-protection",
    name: "Infant Protection Protocol (Healthcare)",
    description: "RFID infant tag security protocol for hospital maternity ward.",
    sector: "Healthcare",
    steps: [
      { id: "rfid-alert", label: "Badge Reader Event", action: "RFID Tag Left Secure Area" },
      { id: "lock-exits", label: "Lockdown Command", action: "Lock Maternity Ward Exits" },
      { id: "security-notify", label: "Security Alert", action: "Notify Security Team" },
      { id: "camera-track", label: "CCTV Motion Detection", action: "Activate Nearby Cameras" }
    ],
    triggers: [{ source: "rfid-maternity-ward", eventType: "infant tag breach" }],
    recommendedDevices: [
      { id: "rfid-maternity-ward", type: "RFID reader", location: { building: "Hospital", floor: "3", room: "Maternity Ward" } }
    ],
    complianceTags: ["HIPAA", "Infant Safety"]
  },
  {
    id: "tmpl-unauthorized-entry",
    name: "Unauthorized Entry (Office)",
    description: "After-hours access denial response for office buildings.",
    sector: "Commercial",
    steps: [
      { id: "access-denied", label: "Access Control Alert", action: "Badge Access Denied" },
      { id: "guard-notify", label: "Security Alert", action: "Notify Guard" },
      { id: "cctv-track", label: "CCTV Motion Detection", action: "Track with Nearest Camera" },
      { id: "sms-alert", label: "Security Alert", action: "Send SMS Alert" }
    ],
    triggers: [{ source: "badge-reader-main", eventType: "access denied", parameters: { schedule: "after-hours" } }],
    recommendedDevices: [
      { id: "badge-reader-main", type: "badge reader", location: { building: "Office", floor: "1", room: "Main Entrance" } }
    ],
    complianceTags: ["Building Security"]
  },
  {
    id: "tmpl-fire-safety",
    name: "Fire Safety Drill",
    description: "Scheduled or emergency fire safety response protocol.",
    sector: "Commercial",
    steps: [
      { id: "fire-alarm", label: "Alarm System", action: "Sound Fire Alarm" },
      { id: "unlock-exits", label: "Lockdown Command", action: "Unlock All Exit Doors" },
      { id: "compliance-log", label: "Compliance Audit Event", action: "Log Fire Drill Event" }
    ],
    triggers: [
      { source: "fire-sensor-system", eventType: "fire detected" },
      { source: "scheduled-event", eventType: "fire drill" }
    ],
    recommendedDevices: [
      { id: "fire-sensor-system", type: "fire sensor", location: { building: "Office", floor: "All", room: "All" } }
    ],
    complianceTags: ["Fire Safety", "OSHA"]
  },
  {
    id: "tmpl-visitor-management",
    name: "Visitor Management (Enterprise)",
    description: "Unscheduled visitor protocol for enterprise facilities.",
    sector: "Commercial",
    steps: [
      { id: "visitor-signin", label: "Visitor Management Event", action: "Unscheduled Visitor Sign-in" },
      { id: "reception-alert", label: "Security Alert", action: "Alert Reception" },
      { id: "camera-view", label: "CCTV Motion Detection", action: "Activate Specific Camera View" },
      { id: "badge-record", label: "Compliance Audit Event", action: "Record Badge Attempt" }
    ],
    triggers: [{ source: "visitor-kiosk", eventType: "unscheduled visitor", parameters: { schedule: "outside-hours" } }],
    recommendedDevices: [
      { id: "visitor-kiosk", type: "visitor kiosk", location: { building: "Enterprise", floor: "1", room: "Lobby" } }
    ],
    complianceTags: ["Visitor Security", "Enterprise Policy"]
  }
];

const WorkflowsContext = createContext<Ctx | undefined>(undefined);

const STORAGE_KEY = "convergence.workflows";

export function WorkflowsProvider({ children }: { children: React.ReactNode }) {
  const [workflows, setWorkflows] = useState<Workflow[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Workflow[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
  }, [workflows]);

  const templates = useMemo(() => defaultTemplates, []);

  const addWorkflow = (name: string, steps: Step[], description?: string, triggers: Trigger[] = [], location?: Location, schedule?: Schedule, complianceTags?: string[]) => {
    if (!name.trim() || steps.length === 0) return undefined;
    const wf: Workflow = { 
      id: `wf_${Date.now()}`, 
      name: name.trim(), 
      description,
      steps, 
      triggers,
      source: "custom",
      location,
      schedule,
      complianceTags
    };
    setWorkflows((prev) => [wf, ...prev]);
    return wf;
  };

  const activateTemplate = (id: string) => {
    const tmpl = templates.find((t) => t.id === id);
    if (!tmpl) return undefined;
    const wf: Workflow = { 
      id: `wf_${Date.now()}`, 
      name: tmpl.name, 
      description: tmpl.description,
      steps: tmpl.steps, 
      triggers: tmpl.triggers,
      source: "template",
      complianceTags: tmpl.complianceTags
    };
    setWorkflows((prev) => [wf, ...prev]);
    return wf;
  };

  const removeWorkflow = (id: string) => setWorkflows((prev) => prev.filter((w) => w.id !== id));
  const clearWorkflows = () => setWorkflows([]);

  const value: Ctx = { workflows, templates, addWorkflow, activateTemplate, removeWorkflow, clearWorkflows };
  return <WorkflowsContext.Provider value={value}>{children}</WorkflowsContext.Provider>;
}

export function useWorkflows() {
  const ctx = useContext(WorkflowsContext);
  if (!ctx) throw new Error("useWorkflows must be used within WorkflowsProvider");
  return ctx;
}
