import SiteHeader from "@/components/SiteHeader";
import Hero from "@/components/Hero";
import IntegrationGrid from "@/components/IntegrationGrid";

const Index = () => {

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Convergence — AI Physical Security Operations Platform",
    applicationCategory: "SecurityApplication",
    operatingSystem: "Web",
    description: "Connect cameras, access control, alarms and IoT with AI automation to build security workflows in minutes.",
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <SiteHeader />
      <Hero />
      <section id="features" className="container max-w-6xl mx-auto py-12">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="card-glass p-6">
            <h3 className="font-semibold mb-1">Integrates All Security Systems</h3>
            <p className="text-sm text-muted-foreground">Unify cameras, access control, alarms, IoT and legacy systems in one dashboard.</p>
          </div>
          <div className="card-glass p-6">
            <h3 className="font-semibold mb-1">AI Vision & Pattern Tracking</h3>
            <p className="text-sm text-muted-foreground">YOLOv10-powered detection across devices with cross‑stream correlation.</p>
          </div>
          <div className="card-glass p-6">
            <h3 className="font-semibold mb-1">Predictive Health & Reporting</h3>
            <p className="text-sm text-muted-foreground">Automated incident reports and proactive device health checks.</p>
          </div>
        </div>
      </section>
      <IntegrationGrid />
    </main>
  );
};

export default Index;
