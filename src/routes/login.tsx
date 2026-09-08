import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth, roleHome } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiAlert } from "@/components/ApiAlert";
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  BookOpen,
} from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In — Lumen LMS" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  const reason = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("reason") : null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const token = await api<string>("/authenticate", { method: "POST", body: { email, password }, auth: false });
      const tokenStr = typeof token === "string" ? token : (token as any)?.token || (token as any)?.jwt;
      if (!tokenStr) throw new Error("No token in response");
      login(tokenStr);
      const claims = JSON.parse(atob(tokenStr.split(".")[1]));
      const role = (claims?.role as string)?.toUpperCase();
      nav({ to: roleHome((role as any) || null) });
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Left side: Brand Showcase (Visible on Large Screens) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between border-r border-border bg-muted/30 p-12 relative overflow-hidden">
        {/* Brand Link */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs transition-transform group-hover:scale-105">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold text-foreground leading-tight">Lumen LMS</span>
            <span className="block text-xs text-muted-foreground">Learning & Development Portal</span>
          </div>
        </Link>

        {/* Showcase Core Content */}
        <div className="max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Empower Your Learning Journey</span>
          </div>
          <h2 className="text-3xl font-bold tracking-normal text-foreground leading-tight">
            Master real-world skills with expert instructors.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Access hundreds of industry-tailored courses, interactive lessons, hands-on assignments, and verified certificates.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-foreground/90 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Interactive lesson checkpoints and quizzes</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-foreground/90 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Accredited certificate generation & public verification</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-foreground/90 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Dedicated instructor workspace & progress analytics</span>
            </div>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="flex items-center gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Encrypted authentication & credential security</span>
        </div>
      </div>

      {/* Right side: Authentication Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-12">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Brand Link */}
          <div className="flex lg:hidden justify-center mb-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-base font-bold text-foreground">Lumen LMS</span>
            </Link>
          </div>

          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl font-bold text-foreground">Sign in to your account</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Enter your credentials to continue your learning workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Timeout & Security Alerts */}
              {reason === "inactivity" && (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-semibold">Session Timed Out:</span> You were signed out after a period of inactivity. Please sign in again.
                </div>
              )}
              {reason === "token_expired" && (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <span className="font-semibold">Session Expired:</span> Your login session has expired. Please sign in again.
                </div>
              )}
              {reason === "unauthorized" && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <span className="font-semibold">Access Required:</span> Please sign in to access that protected resource.
                </div>
              )}

              <ApiAlert error={error} />

              <form onSubmit={submit} className="space-y-4">
                {/* Email / Username / Phone */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold">
                    Email, Username, or Phone
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="text"
                      required
                      placeholder="name@example.com or username"
                      className="pl-9 h-9 text-xs"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs font-semibold">
                      Password
                    </Label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Enter your password"
                      className="pl-9 pr-9 h-9 text-xs"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <Button type="submit" className="w-full h-9 text-xs gap-1.5" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Bottom switch link */}
              <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                  Create account
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Link to="/" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
              <BookOpen className="h-3 w-3" /> Back to Course Catalog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

