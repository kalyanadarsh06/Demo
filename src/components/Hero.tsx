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
    <section ref={ref} className="relative overflow-hidden min-h-[calc(100vh-90px)] flex items-center">
      <div className="absolute inset-0" aria-hidden="true">
        {/* Security video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover opacity-10 z-10"
        >
          <source src="/vecteezy_cyber-security-concept-shield-with-keyhole-icon-on-digital_4827654.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        
        {/* Security-themed static background with circuit patterns and geometric shapes */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/80 to-blue-950/80" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,rgba(16,185,129,0.05),transparent_50%)]" />
        
        {/* Circuit pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M10,10 L90,10 L90,30 L70,30 L70,50 L90,50 L90,90 L10,90 L10,70 L30,70 L30,50 L10,50 Z" 
                      fill="none" stroke="currentColor" strokeWidth="1"/>
                <circle cx="30" cy="30" r="3" fill="currentColor"/>
                <source src="https://files.vecteezy.com/system/resource/files/4827654/technology_security_concept4.mov?response-content-disposition=attachment%3Bfilename%3Dvecteezy_cyber-security-concept-shield-with-keyhole-icon-on-digital_4827654.mov&Expires=1754944746&Signature=IirCxoyCQDgZr4q0hXEbKOkDx9Wawf4CHlr0KjOXYDifcINCx5GcCWlr5HIbEi3-yXB8msXVzNefrucNsbFV45QSFa7F8aO~X-wZZzWqkRhi2Oc-sAo~ArpVbmtkpD4r8qbv2vEoBXZcnEbEoGxciu2dqgP4Hu2lsZjgSLXBlBHeI1P4KLfmuMyRcjGB2xrEpU7RSyxM3bJieLdRK4TFRFBIvSF~Ej7rcsyqhzcFvtVpq9PipnYo9WPwWCzyEEKVrK-b8BxioT1rZwSseJnIK9~8it5kJMlVInaHZigUed4d6~TxP0mfPQCcUgiLt~IM4~qGBBCN11K8qgiJVpp6Mw__&Key-Pair-Id=K3714PYOSHV3HB" type="video/mp4" />
                <circle cx="70" cy="70" r="3" fill="currentColor"/>
                <rect x="45" y="45" width="10" height="10" fill="currentColor"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#circuit)" className="text-blue-400/20"/>
          </svg>
        </div>
        
        {/* Hexagonal security grid overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hexagons" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
                <polygon points="30,2 52,15 52,37 30,50 8,37 8,15" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hexagons)" className="text-emerald-400/30"/>
          </svg>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/95" />
      </div>
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col justify-center items-center text-center space-y-6 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary/90 mb-2 animate-fade-in-up animation-delay-200">
              <Shield className="text-primary animate-pulse" /> AI Security Operations
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-foreground animate-fade-in-up animation-delay-400 max-w-6xl">
              Unify any building's security<br />
              with intelligent AI automation
            </h1>
            <p className="mt-6 text-xl md:text-2xl text-foreground/90 max-w-3xl animate-fade-in-up animation-delay-600">
              We allow pre-existing security hardware to actually talk together.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 justify-center animate-fade-in-up animation-delay-800">
              <Button asChild variant="hero" className="gap-2 text-lg px-8 py-6 hover:scale-105 transition-all duration-300">
                <Link to="/demo"><Zap className="animate-pulse" /> Try Interactive Demo</Link>
              </Button>
              <Button asChild variant="outline" className="text-lg px-8 py-6 hover:scale-105 transition-all duration-300">
                <Link to="/workflows">Browse Templates</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
