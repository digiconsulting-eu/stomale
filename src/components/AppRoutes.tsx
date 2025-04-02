
import { Routes, Route, Navigate } from "react-router-dom";
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
import ImportTab from "@/components/admin/ImportTab";
import InsertCondition from "@/pages/InsertCondition";
import SearchCondition from "@/pages/SearchCondition";
import SearchSymptoms from "@/pages/SearchSymptoms";
import ConditionDetail from "@/pages/ConditionDetail";
import NewReview from "@/pages/NewReview";
import ReviewDetail from "@/pages/ReviewDetail";
import Reviews from "@/pages/Reviews";
import Welcome from "@/pages/Welcome";
import ThankYou from "@/pages/ThankYou";
import AuthCallback from "@/pages/AuthCallback";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/welcome" element={<Welcome />} />
      
      <Route path="/login" element={<Login />} />
      <Route path="/registrati" element={<Register />} />
      <Route path="/recupera-password" element={<RecoverPassword />} />
      <Route path="/aggiorna-password" element={<UpdatePassword />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/terms" element={<Terms />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute adminOnly={false}>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <Admin />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/reviews"
        element={
          <ProtectedRoute adminOnly={true}>
            <ReviewManagement />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute adminOnly={true}>
            <UserManagement />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/import"
        element={
          <ProtectedRoute adminOnly={true}>
            <ImportTab />
          </ProtectedRoute>
        }
      />
      
      <Route path="/inserisci-patologia" element={<InsertCondition />} />
      <Route path="/cerca-patologia" element={<SearchCondition />} />
      <Route path="/cerca-sintomi" element={<SearchSymptoms />} />
      <Route path="/patologia/:condition" element={<ConditionDetail />} />
      <Route path="/patologia/:condition/esperienza/:slug" element={<ReviewDetail />} />
      <Route path="/recensioni" element={<Reviews />} />
      <Route path="/nuova-recensione" element={<NewReview />} />
      <Route path="/grazie" element={<ThankYou />} />
      
      {/* Redirect old paths */}
      <Route 
        path="/news/nutella-e-colesterolo-sono-correlati" 
        element={<Navigate to="/patologia/colesterolo%20alto/esperienza/1004-nutella-e-colesterolo-sono-correlati?-la-nutella-fa-male-al-colesterolo?" replace />} 
      />
      {/* Redirect for the specific incorrectly indexed allergia al nichel URL */}
      <Route 
        path="/patologia/allergia-al-nichel/esperienza/151-ho-appena-scoperto-di-essere-allergica-al-nichel" 
        element={<Navigate to="/patologia/allergia%20al%20nichel/esperienza/155-non-posso-più-mangiare-tanti-alimenti-" replace />} 
      />
      <Route path="/news/*" element={<Navigate to="/recensioni" replace />} />
    </Routes>
  );
};
