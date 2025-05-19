
"use client";

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { EmailPasswordForm } from "./EmailPasswordForm";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { AuthError } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ isOpen, onOpenChange }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [forgotPasswordView, setForgotPasswordView] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const { signUpWithEmail, signInWithEmail, sendPasswordReset } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signUpWithEmail(values.email, values.password);
        toast({ title: "Account Created!", description: "You've successfully signed up." });
      } else {
        await signInWithEmail(values.email, values.password);
        toast({ title: "Signed In!", description: "Welcome back." });
      }
      onOpenChange(false); // Close modal on success
    } catch (error: any) {
      console.error("Auth Error:", error);
      let errorMessage = "An unexpected error occurred.";
      if (error instanceof AuthError) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already in use. Try logging in.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Please enter a valid email address.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password should be at least 6 characters.';
            break;
          case 'auth/user-not-found':
          case 'auth/wrong-password':
          case 'auth/invalid-credential': // Generic error for wrong email/password
            errorMessage = 'Invalid email or password.';
            break;
          default:
            errorMessage = error.message || 'Authentication failed.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast({
        variant: "destructive",
        title: mode === 'signup' ? "Sign Up Failed" : "Sign In Failed",
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      toast({ variant: "destructive", title: "Email Required", description: "Please enter your email address." });
      return;
    }
    setLoading(true);
    try {
      await sendPasswordReset(resetEmail);
      toast({ title: "Password Reset Email Sent", description: "Check your inbox for instructions." });
      setForgotPasswordView(false);
      setResetEmail("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to send reset email." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignInSuccess = () => {
    onOpenChange(false); // Close modal on successful Google sign-in
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) { // Reset views when modal is closed
        setMode('login');
        setForgotPasswordView(false);
        setResetEmail("");
      }
    }}>
      <DialogContent className="sm:max-w-[450px] bg-card text-card-foreground p-8 rounded-lg shadow-2xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-center text-foreground">
            {forgotPasswordView ? "Reset Password" : (mode === 'login' ? 'Log In' : 'Sign Up')}
          </DialogTitle>
          {!forgotPasswordView && (
            <DialogDescription className="text-center text-muted-foreground pt-1">
              {mode === 'login' ? 'Access your Kiwi Anime account.' : 'Create an account to get started.'}
            </DialogDescription>
          )}
        </DialogHeader>
        
        <div className="py-6">
          {forgotPasswordView ? (
            <form onSubmit={handlePasswordReset} className="space-y-6">
              <p className="text-sm text-muted-foreground text-center">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-foreground sr-only">Email address</label>
                <input
                  id="reset-email"
                  name="reset-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="block w-full rounded-md border-0 py-2.5 px-3 bg-background/70 text-foreground shadow-sm ring-1 ring-inset ring-border/50 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
              <Button variant="link" className="w-full text-primary" onClick={() => setForgotPasswordView(false)}>
                Back to Log In
              </Button>
            </form>
          ) : (
            <>
              <EmailPasswordForm 
                mode={mode} 
                onSubmit={handleSubmit} 
                loading={loading} 
                onForgotPassword={() => setForgotPasswordView(true)}
              />
              <div className="my-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border/50" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-card px-2 text-muted-foreground">OR</span>
                  </div>
                </div>
              </div>
              <GoogleSignInButton 
                onSignInSuccess={handleGoogleSignInSuccess}
                className="border-border/50 hover:bg-accent/50"
              />
            </>
          )}
        </div>

        {!forgotPasswordView && (
          <DialogFooter className="sm:justify-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <Button
                variant="link"
                className="font-semibold text-primary hover:underline pl-1"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              >
                {mode === 'login' ? 'Sign up' : 'Log in'}
              </Button>
            </p>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
