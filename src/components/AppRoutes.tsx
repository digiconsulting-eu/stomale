import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import Index from "@/pages/Index";
import ReviewDetail from "@/pages/ReviewDetail";
import Register from "@/pages/Register";
import SearchCondition from "@/pages/SearchCondition";
import SearchSymptoms from "@/pages/SearchSymptoms";
import NewReview from "@/pages/NewReview";
import ConditionDetail from "@/pages/ConditionDetail";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
import UserDashboard from "@/pages/UserDashboard";
import Reviews from "@/pages/Reviews";
import InsertCondition from "@/pages/InsertCondition";
import ReviewManagement from "@/pages/ReviewManagement";
import UserManagement from "@/pages/UserManagement";
import CookiePolicy from "@/pages/CookiePolicy";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Terms from "@/pages/Terms";
import RecoverPassword from "@/pages/RecoverPassword";
import UpdatePassword from "@/pages/UpdatePassword";

export const AppRoutes = () => {
  // Funzione per gestire il redirect della sitemap
  const handleSitemapRedirect = () => {
    window.location.href = 'https://hnuhdoycwpjfjhthfqbt.supabase.co/functions/v1/sitemap';
    return null;
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/patologia/:condition/esperienza/:slug" element={<ReviewDetail />} />
      <Route path="/recensioni" element={<Reviews />} />
      <Route path="/nuova-recensione" element={<NewReview />} />
      <Route path="/cerca-patologia" element={<SearchCondition />} />
      <Route path="/cerca-sintomi" element={<SearchSymptoms />} />
      <Route path="/inserisci-patologia" element={<InsertCondition />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registrati" element={<Register />} />
      <Route path="/recupera-password" element={<RecoverPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route path="/patologia/:condition" element={<ConditionDetail />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<Terms />} />

      {/* Sitemap routes - using direct window.location for XML sitemaps */}
      <Route path="/sitemap.xml" element={<div onLoad={handleSitemapRedirect} />} />
      <Route path="/sitemap-google.xml" element={<div onLoad={handleSitemapRedirect} />} />

      {/* Protected Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/recensioni"
        element={
          <ProtectedRoute>
            <ReviewManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/utenti"
        element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      {/* Protected User routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Catch-all route for 404s - make sure this is last */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};