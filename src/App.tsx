import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { Header } from "./components/Header";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/recensioni" element={<div>Recensioni Page</div>} />
          <Route path="/nuova-recensione" element={<div>Nuova Recensione Page</div>} />
          <Route path="/cerca-patologia" element={<div>Cerca Patologia Page</div>} />
          <Route path="/cerca-sintomi" element={<div>Cerca Sintomi Page</div>} />
          <Route path="/patologie" element={<div>Elenco Patologie Page</div>} />
          <Route path="/inserisci-patologia" element={<div>Inserisci Patologia Page</div>} />
          <Route path="/blog" element={<div>Blog Page</div>} />
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/registrati" element={<div>Registrati Page</div>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;