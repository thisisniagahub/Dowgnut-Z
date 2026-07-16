"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn, signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function AuthModal() {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) return;

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: loginEmail.trim(),
        password: loginPassword,
        redirect: false,
        callbackUrl: "/",
      });

      if (result?.error) {
        toast({
          title: "Login failed",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You're now logged in.",
        });
        setIsOpen(false);
        router.refresh();
      }
    } catch (err) {
      toast({
        title: "Login failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regName.trim() || !regEmail.trim() || !regPassword || !regConfirmPassword) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    if (regPassword !== regConfirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are the same.",
        variant: "destructive",
      });
      return;
    }

    if (regPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          password: regPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({
          title: "Registration failed",
          description: data.error || "Could not create account.",
          variant: "destructive",
        });
        return;
      }

      // Auto-login after registration
      const signInResult = await signIn("credentials", {
        email: regEmail.trim(),
        password: regPassword,
        redirect: false,
        callbackUrl: "/",
      });

      if (signInResult?.error) {
        toast({
          title: "Account created!",
          description: "Please log in with your new credentials.",
        });
        setActiveTab("login");
        setRegName("");
        setRegEmail("");
        setRegPassword("");
        setRegConfirmPassword("");
      } else {
        toast({
          title: "Welcome to DowgNut! 🍩",
          description: "Your account is ready. Let's get some dowgs!",
        });
        setIsOpen(false);
        router.refresh();
      }
    } catch (err) {
      toast({
        title: "Registration failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/", redirect: true });
  };

  if (session) {
    // User is logged in - show user button with dropdown
    return (
      <div className="relative">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="relative inline-flex size-9 items-center justify-center rounded-full bg-[var(--color-dowgnut-pink)] text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
          aria-label="User menu"
        >
          <User className="size-4" />
        </motion.button>
        <AnimatePresence>
          {isOpen && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogContent className="max-w-sm">
                <DialogHeader className="border-b-4 border-[var(--color-dowgnut-pink)] bg-[var(--color-dowgnut-blue)] p-4 text-white">
                  <DialogTitle className="flex items-center gap-3 text-white">
                    <img src="/brand/dowgnut-mascot.png" alt="" className="size-10 animate-float object-contain" />
                    <div>
                      <p className="graffiti-text text-xl leading-none">Hey, {session.user.name}</p>
                      <p className="text-xs font-normal text-white/70">Signed in as {session.user.email}</p>
                    </div>
                  </DialogTitle>
                </DialogHeader>
                <div className="p-4 space-y-2">
                  <Button onClick={handleLogout} variant="outline" className="w-full justify-start gap-2 text-[var(--color-dowgnut-blue-dark)] hover:bg-[var(--color-dowgnut-cream)]">
                    <X className="size-4" />
                    Sign Out
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <>
      {/* Floating action button to open auth modal */}
      {!session && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
          onClick={() => setIsOpen(true)}
          aria-label="Sign in or sign up"
          className="fixed bottom-6 right-6 z-40 inline-flex size-14 items-center justify-center rounded-full bg-[var(--color-dowgnut-blue)] text-white shadow-lg shadow-[var(--color-dowgnut-blue-dark)]/30 transition-transform hover:scale-105 active:scale-95 sm:size-16"
        >
          <User className="size-5" />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-md w-full sm:max-w-lg">
              <DialogHeader className="border-b-4 border-[var(--color-dowgnut-pink)] bg-[var(--color-dowgnut-blue)] p-4 text-white">
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 size-8 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
                <DialogTitle className="flex items-center gap-3 text-white">
                  <img src="/brand/dowgnut-mascot.png" alt="" className="size-10 animate-float object-contain" />
                  <div>
                    <p className="graffiti-text text-xl leading-none">
                      {activeTab === "login" ? "Welcome Back" : "Join the Crew"}
                    </p>
                    <p className="text-xs font-normal text-white/70">
                      {activeTab === "login"
                        ? "Sign in to your DowgNut account"
                        : "Create your account and start ordering"}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
                <TabsList className="grid w-full grid-cols-2 bg-[var(--color-dowgnut-blue-dark)]/10">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="register">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="login-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-dowgnut-blue-dark)]/50" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@dowgnut.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10 h-11 rounded-full bg-white"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-dowgnut-blue-dark)]/50" />
                        <Input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10 h-11 rounded-full bg-white pr-10"
                          disabled={loading}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword(!showLoginPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-dowgnut-blue-dark)]/50 hover:text-[var(--color-dowgnut-blue-dark)]"
                          aria-label={showLoginPassword ? "Hide password" : "Show password"}
                        >
                          {showLoginPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={loading || !loginEmail || !loginPassword}
                      className="w-full h-11 rounded-full bg-[var(--color-dowgnut-pink)] text-white hover:bg-[var(--color-dowgnut-pink-dark)] hover:text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Signing in…
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-name">Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-dowgnut-blue-dark)]/50" />
                        <Input
                          id="reg-name"
                          type="text"
                          placeholder="Jane Doe"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="pl-10 h-11 rounded-full bg-white"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-dowgnut-blue-dark)]/50" />
                        <Input
                          id="reg-email"
                          type="email"
                          placeholder="you@dowgnut.com"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          className="pl-10 h-11 rounded-full bg-white"
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-dowgnut-blue-dark)]/50" />
                        <Input
                          id="reg-password"
                          type={showRegPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          className="pl-10 h-11 rounded-full bg-white pr-10"
                          disabled={loading}
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-dowgnut-blue-dark)]/50 hover:text-[var(--color-dowgnut-blue-dark)]"
                          aria-label={showRegPassword ? "Hide password" : "Show password"}
                        >
                          {showRegPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="reg-confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--color-dowgnut-blue-dark)]/50" />
                        <Input
                          id="reg-confirm-password"
                          type={showRegConfirmPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                          className="pl-10 h-11 rounded-full bg-white pr-10"
                          disabled={loading}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-dowgnut-blue-dark)]/50 hover:text-[var(--color-dowgnut-blue-dark)]"
                          aria-label={showRegConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showRegConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      disabled={loading || !regName || !regEmail || !regPassword || !regConfirmPassword}
                      className="w-full h-11 rounded-full bg-[var(--color-dowgnut-pink)] text-white hover:bg-[var(--color-dowgnut-pink-dark)] hover:text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Creating account…
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-4 pt-4 border-t border-[var(--color-dowgnut-blue-dark)]/10 text-center">
                <p className="text-sm text-[var(--color-dowgnut-blue-dark)]/70">
                  {activeTab === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
                  <button
                    onClick={() => setActiveTab(activeTab === "login" ? "register" : "login")}
                    className="font-semibold text-[var(--color-dowgnut-pink)] hover:text-[var(--color-dowgnut-pink-dark)]"
                  >
                    {activeTab === "login" ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </>
  );
}