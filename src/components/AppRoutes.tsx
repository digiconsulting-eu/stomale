import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RecoverPassword from "@/pages/RecoverPassword";
import UpdatePassword from "@/pages/UpdatePassword";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import CookiePolicy from "@/pages/CookiePolicy";
import Terms from "@/pages/Terms";
import UserDashboard from "@/pages/UserDashboard";
import Admin from "@/pages/Admin";
import ReviewManagement from "@/pages/ReviewManagement";
import UserManagement from "@/pages/UserManagement";
import InsertCondition from "@/pages/InsertCondition";
import SearchCondition from "@/pages/SearchCondition";
import SearchSymptoms from "@/pages/SearchSymptoms";
import ConditionDetail from "@/pages/ConditionDetail";
import NewReview from "@/pages/NewReview";
import ReviewDetail from "@/pages/ReviewDetail";
import Reviews from "@/pages/Reviews";
import { SitemapRedirect } from "./SitemapRedirect";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      
      <Route path="/login" element={<Login />} />
      <Route path="/registrati" element={<Register />} />
      <Route path="/recupera-password" element={<RecoverPassword />} />
      <Route path="/aggiorna-password" element={<UpdatePassword />} />
      
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/terms" element={<Terms />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/reviews"
        element={
          <ProtectedRoute>
            <ReviewManagement />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      
      <Route path="/inserisci-patologia" element={<InsertCondition />} />
      <Route path="/cerca-patologia" element={<SearchCondition />} />
      <Route path="/cerca-sintomi" element={<SearchSymptoms />} />
      <Route path="/patologia/:condition" element={<ConditionDetail />} />
      <Route path="/recensione/:id" element={<ReviewDetail />} />
      <Route path="/recensioni" element={<Reviews />} />
      <Route path="/nuova-recensione" element={<NewReview />} />
      
      <Route path="/sitemap.xml" element={<SitemapRedirect />} />
      <Route path="/sitemap-google.xml" element={<SitemapRedirect />} />
    </Routes>
  );
};