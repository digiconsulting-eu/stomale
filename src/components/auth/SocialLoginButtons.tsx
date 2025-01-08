import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

export const SocialLoginButtons = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <div className="flex justify-center">
      <Button
        variant="outline"
        className="w-full max-w-[200px]"
        onClick={() => {/* TODO: Implement Google login */}}
        disabled={isLoading}
      >
        <FcGoogle className="h-5 w-5 mr-2" />
        <span>Google</span>
      </Button>
    </div>
  );
};