import heroImage from "@/assets/hero-security.jpg";
import { Button } from "@/components/ui/button";
import { Shield, Zap } from "lucide-react";
import { useEffect, useRef } from "react";

const Hero = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--mouse-x", `${x}%`);
      el.style.setProperty("--mouse-y", `${y}%`);
    };
    const onLeave = () => {
      el.style.removeProperty("--mouse-x");
      el.style.removeProperty("--mouse-y");
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden">
      <div className="absolute inset-0 bg-hero" aria-hidden="true" />
      <div className="relative container max-w-6xl mx-auto grid md:grid-cols-2 gap-10 py-20 md:py-28">
        <div className="flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground/90 mb-4">
            <Shield className="text-primary" /> AI Security Operations
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
            Unify physical security with AI workflows
          </h1>
          <p className="mt-4 text-lg text-foreground/90">
            Connect CCTV, access control, alarms, IoT and legacy systems. Automate real-time response with vision models and event-driven playbooks.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="hero" className="gap-2">
              <Zap /> Try Interactive Demo
            </Button>
            <Button variant="outline">Browse Templates</Button>
          </div>
        </div>
        <div className="relative">
          <img
            src={heroImage}
            alt="AI security operations platform hero illustration"
            loading="eager"
            className="w-full h-full object-cover rounded-xl shadow-2xl border"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
