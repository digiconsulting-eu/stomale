import { Button } from "@/components/ui/button";
import { Facebook, Linkedin } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

export const SocialLoginButtons = ({ isLoading }: { isLoading: boolean }) => {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {/* TODO: Implement Google login */}}
        disabled={isLoading}
      >
        <FcGoogle className="h-5 w-5" />
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {/* TODO: Implement Facebook login */}}
        disabled={isLoading}
      >
        <Facebook className="h-5 w-5 text-blue-600" />
      </Button>
      <Button
        variant="outline"
        className="w-full"
        onClick={() => {/* TODO: Implement LinkedIn login */}}
        disabled={isLoading}
      >
        <Linkedin className="h-5 w-5 text-blue-700" />
      </Button>
    </div>
  );
};