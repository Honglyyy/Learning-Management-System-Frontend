import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiAlert } from "@/components/ApiAlert";
import { toast } from "sonner";
import {
  GraduationCap,
  User,
  Mail,
  Lock,
  Phone,
  AtSign,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  BookOpen,
  Award,
} from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create Account — Lumen LMS" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    username: "",
    password: "",
    role: "STUDENT" as "STUDENT" | "INSTRUCTOR",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api("/register", { method: "POST", body: form, auth: false });
      toast.success("Account created successfully. Please verify your email with the OTP code.");
      nav({ to: "/verify-otp", search: { email: form.email } as any });
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Left side: Brand Showcase (Visible on Large Screens) */}
      <div className="hidden lg:flex lg:w-5/12 flex-col justify-between border-r border-border bg-muted/30 p-12 relative overflow-hidden">
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
            <span>Join Our Global Community</span>
          </div>
          <h2 className="text-3xl font-bold tracking-normal text-foreground leading-tight">
            Start learning or sharing your expertise today.
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Whether advancing your tech career or mentoring eager students worldwide, Lumen gives you the professional tools to succeed.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-foreground/90 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Full curriculum access and project checkpoints</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-foreground/90 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Verified credentials shared directly with employers</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-foreground/90 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Fast one-click enrollment and progress tracking</span>
            </div>
          </div>
        </div>

        {/* Bottom Security Badge */}
        <div className="flex items-center gap-3 border-t border-border pt-6 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Strict data privacy and end-to-end security</span>
        </div>
      </div>

      {/* Right side: Registration Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-10 sm:px-6 lg:px-12">
        <div className="w-full max-w-lg space-y-6">
          {/* Mobile Brand Link */}
          <div className="flex lg:hidden justify-center mb-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-base font-bold text-foreground">Lumen LMS</span>
            </Link>
          </div>

          <Card className="border border-border bg-card shadow-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl font-bold text-foreground">Create your account</CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Set up your profile to enroll in courses or teach students.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ApiAlert error={error} />

              <form onSubmit={submit} className="space-y-4">
                {/* Role Selector Cards */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Account Purpose</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, role: "STUDENT" })}
                      className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        form.role === "STUDENT"
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-card hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`p-1.5 rounded-md ${form.role === "STUDENT" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                          <BookOpen className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-bold text-foreground">Student</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground leading-tight">
                        Enroll in courses & earn certificates
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm({ ...form, role: "INSTRUCTOR" })}
                      className={`flex flex-col items-start p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        form.role === "INSTRUCTOR"
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border bg-card hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`p-1.5 rounded-md ${form.role === "INSTRUCTOR" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}>
                          <Award className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-bold text-foreground">Instructor</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground leading-tight">
                        Build courses & teach students
                      </span>
                    </button>
                  </div>
                </div>

                {/* Name & Username Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-xs font-semibold">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        placeholder="Jane Doe"
                        className="pl-9 h-9 text-xs"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="username" className="text-xs font-semibold">Username</Label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        required
                        placeholder="janedoe"
                        className="pl-9 h-9 text-xs"
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Email & Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="name@example.com"
                        className="pl-9 h-9 text-xs"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phoneNumber" className="text-xs font-semibold">Phone (Optional)</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phoneNumber"
                        placeholder="+1 234 567 890"
                        className="pl-9 h-9 text-xs"
                        value={form.phoneNumber}
                        onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold">Password (min 8 characters)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      placeholder="Create a strong password"
                      className="pl-9 pr-9 h-9 text-xs"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
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
                <Button type="submit" className="w-full h-9 text-xs gap-1.5 mt-2" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </form>

              {/* Bottom switch link */}
              <div className="border-t border-border pt-4 text-center text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Sign in
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

