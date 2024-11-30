import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
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
import Footer from "./components/Footer";
import InsertCondition from "./pages/InsertCondition";
import Blog from "./pages/Blog";
import AddArticle from "./pages/AddArticle";
import ArticleDetail from "./pages/ArticleDetail";
import ReviewManagement from "./pages/ReviewManagement";
import UserManagement from "./pages/UserManagement";
import CookiePolicy from "./pages/CookiePolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import { CookieConsent } from "./components/CookieConsent";

const ScrollToTop = () => {
  const location = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/patologia/:condition/esperienza/:title" element={<ReviewDetail />} />
              <Route path="/recensioni" element={<Reviews />} />
              <Route path="/nuova-recensione" element={<NewReview />} />
              <Route path="/cerca-patologia" element={<SearchCondition />} />
              <Route path="/cerca-sintomi" element={<div>Cerca Sintomi Page</div>} />
              <Route path="/inserisci-patologia" element={<InsertCondition />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/nuovo" element={<AddArticle />} />
              <Route path="/blog/articolo/:id" element={<ArticleDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/registrati" element={<Register />} />
              <Route path="/recupera-password" element={<div>Recupera Password Page</div>} />
              <Route path="/patologia/:condition" element={<ConditionDetail />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/recensioni" element={<ReviewManagement />} />
              <Route path="/admin/utenti" element={<UserManagement />} />
              <Route path="/dashboard" element={<UserDashboard />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<Terms />} />
            </Routes>
          </main>
          <Footer />
          <CookieConsent />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;