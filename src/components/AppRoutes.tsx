import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import Index from "@/pages/Index";
import ReviewDetail from "@/pages/ReviewDetail";
import Register from "@/pages/Register";
import SearchCondition from "@/pages/SearchCondition";
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
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/patologia/:condition/recensione/:id" element={<ReviewDetail />} />
      <Route path="/recensioni" element={<Reviews />} />
      <Route path="/nuova-recensione" element={<NewReview />} />
      <Route path="/cerca-patologia" element={<SearchCondition />} />
      <Route path="/cerca-sintomi" element={<div>Cerca Sintomi Page</div>} />
      <Route path="/inserisci-patologia" element={<InsertCondition />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registrati" element={<Register />} />
      <Route path="/recupera-password" element={<RecoverPassword />} />
      <Route path="/update-password" element={<UpdatePassword />} />
      <Route path="/patologia/:condition" element={<ConditionDetail />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/recensioni" element={<ReviewManagement />} />
      <Route path="/admin/utenti" element={<UserManagement />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        } 
      />
      <Route path="/cookie-policy" element={<CookiePolicy />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<Terms />} />
    </Routes>
  );
};