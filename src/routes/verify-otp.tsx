import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { ApiAlert } from "@/components/ApiAlert";
import { toast } from "sonner";
import {
  GraduationCap,
  ShieldCheck,
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  RefreshCw,
  BookOpen,
} from "lucide-react";

type Search = { email?: string };

export const Route = createFileRoute("/verify-otp")({
  head: () => ({ meta: [{ title: "Verify Email — Lumen LMS" }] }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    email: typeof s.email === "string" ? s.email : undefined,
  }),
  component: VerifyOtpPage,
});

function VerifyOtpPage() {
  const search = useSearch({ from: "/verify-otp" });
  const nav = useNavigate();
  const [email, setEmail] = useState(search.email || "");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== 6) {
      setError(new Error("Please enter the complete 6-digit verification code."));
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await api("/verify-otp", { method: "POST", body: { email, otp }, auth: false });
      toast.success("Email verified successfully! You can now sign in.");
      nav({ to: "/login" });
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (!email) {
      setError(new Error("Please provide your email address to receive a new code."));
      return;
    }
    setResending(true);
    try {
      await api("/resend-otp", { method: "POST", body: { email }, auth: false });
      toast.success("A new verification code has been dispatched to your inbox.");
    } catch (e) {
      setError(e);
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background px-4 py-12 text-foreground">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Link */}
        <div className="flex justify-center">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs transition-transform group-hover:scale-105">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold text-foreground leading-tight">Lumen LMS</span>
            </div>
          </Link>
        </div>

        <Card className="border border-border bg-card shadow-sm">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-1">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold text-foreground">Verify your email address</CardTitle>
            <CardDescription className="text-xs text-muted-foreground max-w-xs mx-auto leading-relaxed">
              We have sent a 6-digit confirmation code to your email. Enter it below to activate your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <ApiAlert error={error} />

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">Account Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="pl-9 h-9 text-xs"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <Label className="text-xs font-semibold text-center block">6-Digit Code</Label>
                <div className="flex justify-center py-1">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp} autoFocus>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="h-11 w-10 text-base font-semibold border-border" />
                      <InputOTPSlot index={1} className="h-11 w-10 text-base font-semibold border-border" />
                      <InputOTPSlot index={2} className="h-11 w-10 text-base font-semibold border-border" />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} className="h-11 w-10 text-base font-semibold border-border" />
                      <InputOTPSlot index={4} className="h-11 w-10 text-base font-semibold border-border" />
                      <InputOTPSlot index={5} className="h-11 w-10 text-base font-semibold border-border" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-9 text-xs gap-1.5 mt-2"
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Verifying code...
                  </>
                ) : (
                  <>
                    Verify & activate account <ArrowRight className="h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </form>

            <div className="flex items-center justify-between border-t border-border pt-4 text-xs">
              <button
                type="button"
                onClick={resend}
                disabled={resending}
                className="inline-flex items-center gap-1.5 text-primary font-medium hover:underline disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${resending ? "animate-spin" : ""}`} />
                {resending ? "Sending..." : "Resend code"}
              </button>

              <Link
                to="/login"
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3 w-3" /> Back to sign in
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
  );
}

