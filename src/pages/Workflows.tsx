import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import WorkflowBuilder, { type Step } from "@/components/WorkflowBuilder";
import { useState } from "react";
import { useWorkflows } from "@/context/WorkflowsContext";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

const Workflows = () => {
  const { templates, workflows, activateTemplate, addWorkflow, removeWorkflow } = useWorkflows();
  const [name, setName] = useState("");
  const [lastSteps, setLastSteps] = useState<Step[]>([]);

  const onRun = (steps: Step[]) => setLastSteps(steps);

  const save = () => {
    const wf = addWorkflow(name, lastSteps);
    if (wf) {
      toast({ title: "Workflow saved", description: `Saved \"${wf.name}\" with ${wf.steps.length} steps.` });
      setName("");
      setLastSteps([]);
    } else {
      toast({ title: "Missing details", description: "Enter a name and build at least one step.", variant: "destructive" });
    }
  };

  return (
    <main>
      <SiteHeader />
      <section className="container max-w-6xl mx-auto py-12">
        <h1 className="text-3xl md:text-4xl font-bold">Workflows and Templates</h1>
        <p className="mt-2 text-muted-foreground">Create your own or activate a template for the demo.</p>
      </section>

      <section className="container max-w-6xl mx-auto py-8" id="templates">
        <h2 className="text-2xl font-semibold mb-4">Templates</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {templates.map((t) => (
            <Card key={t.id} className="p-4 space-y-2">
              <div className="font-medium">{t.name}</div>
              <p className="text-sm text-muted-foreground">{t.description}</p>
              <Button onClick={() => activateTemplate(t.id)} className="w-full">Activate</Button>
            </Card>
          ))}
        </div>
      </section>

      <section className="container max-w-6xl mx-auto py-8">
        <h2 className="text-2xl font-semibold mb-2">Build a Workflow</h2>
        <p className="text-sm text-muted-foreground mb-4">Drag and drop steps, then name and save it.</p>
        <div className="grid gap-4">
          <div className="flex items-center gap-3">
            <Input placeholder="Workflow name" value={name} onChange={(e) => setName(e.target.value)} />
            <Button variant="secondary" onClick={save}>Save Workflow</Button>
          </div>
          <WorkflowBuilder onRun={onRun} />
        </div>
      </section>

      <section className="container max-w-6xl mx-auto py-8">
        <h2 className="text-2xl font-semibold mb-2">Saved Workflows</h2>
        {workflows.length === 0 ? (
          <Card className="p-4 text-muted-foreground">No workflows yet. Activate a template or build one above.</Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {workflows.map((w) => (
              <Card key={w.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{w.name}</div>
                  <div className="text-xs text-muted-foreground">{w.steps.length} steps • {w.source}</div>
                </div>
                <Button variant="outline" onClick={() => removeWorkflow(w.id)}>Remove</Button>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Workflows;
