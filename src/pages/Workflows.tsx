import SiteHeader from "@/components/SiteHeader";
import WorkflowBuilder, { type Step } from "@/components/WorkflowBuilder";
import { useState } from "react";

const Workflows = () => {
  const [lastSteps, setLastSteps] = useState<Step[]>([]);

  const onRun = (steps: Step[]) => setLastSteps(steps);

  return (
    <main>
      <SiteHeader />
      <WorkflowBuilder onRun={onRun} />


    </main>
  );
};

export default Workflows;
