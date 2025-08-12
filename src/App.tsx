import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Workflows from "./pages/Workflows";
import LiveDemo from "./pages/LiveDemo";
import EnhancedDemo from "./pages/EnhancedDemo";
import { WorkflowsProvider } from "./context/WorkflowsContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <WorkflowsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/workflows" element={<Workflows />} />
            <Route path="/demo" element={<LiveDemo />} />
            <Route path="/enhanced-demo" element={<EnhancedDemo />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WorkflowsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
