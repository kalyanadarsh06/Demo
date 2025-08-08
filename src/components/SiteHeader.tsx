import { Button } from "@/components/ui/button";
import { Shield, Zap, Boxes } from "lucide-react";

const SiteHeader = () => {
  return (
    <header className="w-full sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b">
      <nav className="container max-w-6xl mx-auto flex items-center justify-between h-16">
        <a href="/" className="inline-flex items-center gap-2 font-semibold">
          <Shield className="text-primary" />
          <span>SentinelOS</span>
        </a>
        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#integrations" className="hover:text-foreground transition-colors">Integrations</a>
          <a href="#workflows" className="hover:text-foreground transition-colors">Workflows</a>
          <a href="#demo" className="hover:text-foreground transition-colors">Live Demo</a>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="hidden sm:inline-flex">Docs</Button>
          <Button variant="hero" className="inline-flex items-center gap-2">
            <Zap className="opacity-90" />
            Launch Demo
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default SiteHeader;
