
"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AuthError } from "firebase/auth";

interface GoogleSignInButtonProps {
  onSignInSuccess?: () => void;
  onSignInError?: (error: any) => void;
  className?: string;
}

export function GoogleSignInButton({ onSignInSuccess, onSignInError, className }: GoogleSignInButtonProps) {
  const { signInWithGoogle } = useAuth();
  const { toast } = useToast();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      toast({
        title: "Signed in with Google!",
        description: "Welcome back.",
      });
      onSignInSuccess?.();
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      let errorMessage = "An unexpected error occurred during Google Sign-In.";
      if (error instanceof AuthError) {
        switch (error.code) {
          case "auth/popup-closed-by-user":
            errorMessage = "Sign-in popup closed by user.";
            break;
          case "auth/cancelled-popup-request":
            errorMessage = "Multiple sign-in popups open. Please close others.";
            break;
          case "auth/popup-blocked":
            errorMessage = "Popup blocked by browser. Please allow popups for this site.";
            break;
          default:
            errorMessage = error.message || "Failed to sign in with Google.";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        variant: "destructive",
        title: "Google Sign-In Failed",
        description: errorMessage,
      });
      onSignInError?.(error);
    }
  };

  return (
    <Button
      variant="outline"
      className={`w-full ${className}`}
      onClick={handleGoogleSignIn}
    >
      <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 65.9L352.6 128.2c-23.2-21.5-55.2-34.4-94.6-34.4-72.3 0-131.2 57.8-131.2 129.8s58.9 129.8 131.2 129.8c79.2 0 111.4-55.6 116.1-85.1H248v-65.8h239.2c1.2 12.3 1.8 24.9 1.8 37.8z"></path>
      </svg>
      Sign in with Google
    </Button>
  );
}
