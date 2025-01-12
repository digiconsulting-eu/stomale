import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RecoverPassword from "@/pages/RecoverPassword";
import UpdatePassword from "@/pages/UpdatePassword";
import NewReview from "@/pages/NewReview";
import Reviews from "@/pages/Reviews";
import ReviewDetail from "@/pages/ReviewDetail";
import SearchCondition from "@/pages/SearchCondition";
import InsertCondition from "@/pages/InsertCondition";
import SearchSymptoms from "@/pages/SearchSymptoms";
import ConditionDetail from "@/pages/ConditionDetail";
import Admin from "@/pages/Admin";
import ReviewManagement from "@/pages/ReviewManagement";
import UserManagement from "@/pages/UserManagement";
import UserDashboard from "@/pages/UserDashboard";
import CookiePolicy from "@/pages/CookiePolicy";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Terms from "@/pages/Terms";
import { useEffect } from "react";

// Sitemap redirect component
const SitemapRedirect = () => {
  useEffect(() => {
    window.location.href = 'https://hnuhdoycwpjfjhthfqbt.supabase.co/functions/v1/sitemap';
  }, []);
  
  return null;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/recover-password" element={<RecoverPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route path="/recensioni" element={<Reviews />} />
      <Route path="/recensioni/:id" element={<ReviewDetail />} />
      <Route path="/cerca-patologia" element={<SearchCondition />} />
      <Route path="/cerca-sintomi" element={<SearchSymptoms />} />
      <Route path="/patologia/:id" element={<ConditionDetail />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<Terms />} />

      {/* Sitemap routes */}
      <Route path="/sitemap.xml" element={<SitemapRedirect />} />
      <Route path="/sitemap-google.xml" element={<SitemapRedirect />} />

      {/* Protected Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <ProtectedRoute adminOnly>
            <ReviewManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute adminOnly>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      {/* Protected User routes */}
      <Route
        path="/nuova-recensione"
        element={
          <ProtectedRoute>
            <NewReview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inserisci-patologia"
        element={
          <ProtectedRoute>
            <InsertCondition />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};