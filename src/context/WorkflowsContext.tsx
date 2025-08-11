import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Step = { id: string; label: string };
export type Workflow = { id: string; name: string; steps: Step[]; source: "custom" | "template" };
export type Template = { id: string; name: string; description: string; steps: Step[] };

type Ctx = {
  workflows: Workflow[];
  templates: Template[];
  addWorkflow: (name: string, steps: Step[]) => Workflow | undefined;
  activateTemplate: (id: string) => Workflow | undefined;
  removeWorkflow: (id: string) => void;
  clearWorkflows: () => void;
};

const defaultTemplates: Template[] = [
  {
    id: "tmpl-perimeter",
    name: "Perimeter Breach Response",
    description: "Detect perimeter intrusion and notify guard with escalation.",
    steps: [
      { id: "camera", label: "CCTV Event" },
      { id: "yolo", label: "YOLOv10 Detect" },
      { id: "notify", label: "Notify Guard" },
      { id: "escalate", label: "Call Authority" },
    ],
  },
  {
    id: "tmpl-tailgating",
    name: "Anti‑Tailgating",
    description: "Detect tailgating at access points and lock door.",
    steps: [
      { id: "access", label: "Door Forced" },
      { id: "yolo", label: "YOLOv10 Detect" },
      { id: "notify", label: "Notify Guard" },
    ],
  },
  {
    id: "tmpl-health",
    name: "Device Health Monitor",
    description: "Predictive device failure and self‑healing tasks.",
    steps: [
      { id: "camera", label: "CCTV Event" },
      { id: "notify", label: "Notify Guard" },
    ],
  },
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

  const addWorkflow = (name: string, steps: Step[]) => {
    if (!name.trim() || steps.length === 0) return undefined;
    const wf: Workflow = { id: `wf_${Date.now()}`, name: name.trim(), steps, source: "custom" };
    setWorkflows((prev) => [wf, ...prev]);
    return wf;
  };

  const activateTemplate = (id: string) => {
    const tmpl = templates.find((t) => t.id === id);
    if (!tmpl) return undefined;
    const wf: Workflow = { id: `wf_${Date.now()}`, name: tmpl.name, steps: tmpl.steps, source: "template" };
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
