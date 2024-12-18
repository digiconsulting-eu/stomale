import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ReviewForm } from "@/components/review/ReviewForm";
import { setPageTitle, getDefaultPageTitle } from "@/utils/pageTitle";

export default function NewReview() {
  useEffect(() => {
    setPageTitle(getDefaultPageTitle("Racconta la tua Esperienza"));
  }, []);

  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const [searchParams] = useSearchParams();
  const conditionParam = searchParams.get("patologia");

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Devi effettuare l'accesso per raccontare la tua esperienza");
      navigate("/registrati");
    }
  }, [isLoggedIn, navigate]);

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="container max-w-3xl py-8 space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold text-center text-primary">
        Racconta la tua Esperienza
      </h1>
      
      <div className="card">
        <ReviewForm defaultCondition={conditionParam || ""} />
      </div>
    </div>
  );
}
