
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox"; // Assuming you have a Checkbox component
import React from "react";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
  rememberMe: z.boolean().optional(),
});

const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ["confirmPassword"], // Path to field to display error
});

interface EmailPasswordFormProps {
  mode: "login" | "signup";
  onSubmit: (values: any) => Promise<void>; // Simplified 'any' for now
  loading: boolean;
  onForgotPassword?: () => void;
}

export function EmailPasswordForm({ mode, onSubmit, loading, onForgotPassword }: EmailPasswordFormProps) {
  const currentSchema = mode === "login" ? loginSchema : signUpSchema;
  type CurrentFormValues = z.infer<typeof currentSchema>;

  const form = useForm<CurrentFormValues>({
    resolver: zodResolver(currentSchema),
    defaultValues: mode === "login" 
      ? { email: "", password: "", rememberMe: false } 
      : { email: "", password: "", confirmPassword: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="your@email.com" 
                  {...field} 
                  className="bg-background/70 border-border/50 focus:border-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  {...field} 
                  className="bg-background/70 border-border/50 focus:border-primary"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {mode === "signup" && (
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    {...field} 
                    className="bg-background/70 border-border/50 focus:border-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {mode === "login" && (
          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal text-muted-foreground">
                    Remember me
                  </FormLabel>
                </FormItem>
              )}
            />
            {onForgotPassword && (
                 <Button variant="link" type="button" onClick={onForgotPassword} className="p-0 h-auto text-sm text-primary hover:underline">
                    Forgot password?
                 </Button>
            )}
          </div>
        )}
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={loading}>
          {loading ? (mode === "login" ? "Signing In..." : "Signing Up...") : (mode === "login" ? "Sign In" : "Sign Up")}
        </Button>
      </form>
    </Form>
  );
}
