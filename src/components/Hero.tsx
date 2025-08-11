import { Button } from "@/components/ui/button";
import { Shield, Zap } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

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
      <div className="absolute inset-0" aria-hidden="true">
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          src="/videos/hero.mp4"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-hero mix-blend-overlay" />
      </div>
      <div className="relative container max-w-6xl mx-auto grid md:grid-cols-2 gap-10 py-20 md:py-28">
        <div className="flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground/90 mb-4">
            <Shield className="text-primary" /> AI Security Operations
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
            Convergence — unify physical security with AI workflows
          </h1>
          <p className="mt-4 text-lg text-foreground/90">
            Integrate CCTV, access control, alarms, IoT and legacy systems. Automate real-time response with vision models and event-driven playbooks.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="hero" className="gap-2">
              <Link to="/demo"><Zap /> Try Interactive Demo</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/workflows">Browse Templates</Link>
            </Button>
          </div>
        </div>
        <div className="relative hidden md:block" aria-hidden="true">
          {/* Visual kept minimal since video is the hero background */}
        </div>
      </div>
    </section>
  );
};

export default Hero;
