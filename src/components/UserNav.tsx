
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, User as UserIcon } from "lucide-react"; // User is an icon from lucide
import { useToast } from "@/hooks/use-toast";

export function UserNav() {
  const { user, signOutUser } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      toast({ title: "Signed Out", description: "You have been successfully signed out." });
    } catch (error) {
      console.error("Sign out error", error);
      toast({ variant: "destructive", title: "Sign Out Failed", description: "Could not sign out. Please try again." });
    }
  };

  if (!user) {
    return null; // Or a login button if preferred here, though header handles it
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    const names = name.split(' ');
    if (names.length > 1) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
          <Avatar className="h-9 w-9 border border-border/50">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "User Avatar"} />
            <AvatarFallback className="bg-muted text-muted-foreground">
              {getInitials(user.displayName || user.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-card border-border/70 shadow-lg" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">
              {user.displayName || "User"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        {/* <DropdownMenuGroup>
          <DropdownMenuItem className="hover:bg-accent/50 focus:bg-accent/50">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-border/50"/> */}
        <DropdownMenuItem onClick={handleSignOut} className="hover:bg-accent/50 focus:bg-accent/50 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
