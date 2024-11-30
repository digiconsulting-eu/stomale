import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ReviewDetail from "./pages/ReviewDetail";
import Register from "./pages/Register";
import SearchCondition from "./pages/SearchCondition";
import NewReview from "./pages/NewReview";
import ConditionDetail from "./pages/ConditionDetail";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import Reviews from "./pages/Reviews";
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
          <Route path="/recensione/:id" element={<ReviewDetail />} />
          <Route path="/recensioni" element={<Reviews />} />
          <Route path="/nuova-recensione" element={<NewReview />} />
          <Route path="/cerca-patologia" element={<SearchCondition />} />
          <Route path="/cerca-sintomi" element={<div>Cerca Sintomi Page</div>} />
          <Route path="/inserisci-patologia" element={<div>Inserisci Patologia Page</div>} />
          <Route path="/blog" element={<div>Blog Page</div>} />
          <Route path="/login" element={<Login />} />
          <Route path="/registrati" element={<Register />} />
          <Route path="/recupera-password" element={<div>Recupera Password Page</div>} />
          <Route path="/patologia/:condition" element={<ConditionDetail />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/dashboard" element={<UserDashboard />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;