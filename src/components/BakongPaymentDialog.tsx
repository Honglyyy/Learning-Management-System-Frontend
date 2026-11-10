import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import {
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Loader2,
  QrCode,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ApiAlert } from "@/components/ApiAlert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface BakongPaymentRecord {
  paymentId: number;
  courseId: number;
  courseTitle?: string;
  amount: number;
  originalAmount?: number | null;
  discountAmount?: number | null;
  isReEnrollmentDiscount?: boolean;
  provider?: string;
  providerReference?: string | null;
  status: string;
  qrCode?: string | null;
  md5?: string | null;
  deepLink?: string | null;
  currency?: string | null;
  expiresAt?: string | number | null;
  paidAt?: string | number | null;
}

interface BakongPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: BakongPaymentRecord | null;
  onPaid?: (payment: BakongPaymentRecord) => void;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function BakongPaymentDialog({
  open,
  onOpenChange,
  payment,
  onPaid,
  onRegenerate,
  isRegenerating = false,
}: BakongPaymentDialogProps) {
  const qc = useQueryClient();
  const notifiedPaymentIdRef = useRef<number | null>(null);
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  const paymentId = payment?.paymentId;

  const statusQuery = useQuery<BakongPaymentRecord>({
    queryKey: ["bakong-payment-status", paymentId],
    queryFn: () =>
      api<BakongPaymentRecord>(`/api/payments/${paymentId}/status`, {
        auth: true,
      }),
    initialData: payment ?? undefined,
    enabled: open && Boolean(paymentId),
    refetchInterval: (query) => {
      const st = query.state.data?.status;
      return open && st === "PENDING" ? 3000 : false;
    },
    refetchOnWindowFocus: true,
    retry: false,
  });

  const current = statusQuery.data ?? payment;
  const isPaid = current?.status === "PAID";
  const isExpired = current?.status === "EXPIRED";
  const isFailed = current?.status === "FAILED" || current?.status === "REFUNDED";

  const remainingSeconds = useMemo(() => {
    if (!current?.expiresAt) return null;
    const target = new Date(current.expiresAt).getTime();
    if (Number.isNaN(target)) return null;
    return Math.max(0, Math.floor((target - nowMs) / 1000));
  }, [current?.expiresAt, nowMs]);

  useEffect(() => {
    if (!open || !current?.expiresAt || current.status !== "PENDING") return;
    setNowMs(Date.now());
    const id = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(id);
  }, [open, current?.expiresAt, current?.status]);

  // Trigger a status check right when the client timer hits 0 so backend can mark EXPIRED cleanly
  useEffect(() => {
    if (
      open &&
      current?.status === "PENDING" &&
      remainingSeconds === 0 &&
      !statusQuery.isFetching
    ) {
      statusQuery.refetch();
    }
  }, [open, current?.status, remainingSeconds, statusQuery]);

  // Fire completion callbacks & invalidate caches once per paymentId
  useEffect(() => {
    if (!open || !current || current.status !== "PAID") return;
    if (notifiedPaymentIdRef.current === current.paymentId) return;
    notifiedPaymentIdRef.current = current.paymentId;

    qc.invalidateQueries({ queryKey: ["my-payments"] });
    qc.invalidateQueries({ queryKey: ["my-enrollments"] });
    qc.invalidateQueries({ queryKey: ["continue-learning"] });
    if (current.courseId) {
      qc.invalidateQueries({ queryKey: ["course", String(current.courseId)] });
      qc.invalidateQueries({ queryKey: ["lessons-status", String(current.courseId)] });
    }
    toast.success("Bakong payment confirmed! You are now enrolled.");
    onPaid?.(current);
  }, [open, current, qc, onPaid]);

  useEffect(() => {
    if (!open) {
      notifiedPaymentIdRef.current = null;
    }
  }, [open]);

  if (!current) return null;

  const copyReference = async () => {
    const value = current.providerReference || String(current.paymentId);
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Reference copied to clipboard");
    } catch {
      toast.error("Unable to copy reference");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="inline-flex items-center rounded bg-[#e1232e] px-2 py-0.5 text-xs font-bold tracking-wider text-white">
              KHQR
            </span>
            <span>Pay with Bakong</span>
          </DialogTitle>
          <DialogDescription>
            Scan this KHQR code using the Bakong app or any participating Cambodian mobile banking
            app.
          </DialogDescription>
        </DialogHeader>

        <ApiAlert error={statusQuery.error} />

        {/* Price Summary Card */}
        <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-1.5">
          <div className="text-sm font-semibold text-foreground line-clamp-1">
            {current.courseTitle || `Course #${current.courseId}`}
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Amount Due</span>
            <div className="flex items-center gap-2">
              {current.isReEnrollmentDiscount && current.originalAmount != null && (
                <>
                  <span className="text-xs line-through text-muted-foreground">
                    ${Number(current.originalAmount).toFixed(2)}
                  </span>
                  <Badge className="bg-emerald-600 text-white text-[10px]">50% OFF</Badge>
                </>
              )}
              <span className="text-lg font-bold text-foreground">
                ${Number(current.amount ?? 0).toFixed(2)}{" "}
                <span className="text-xs font-medium text-muted-foreground">
                  {current.currency || "USD"}
                </span>
              </span>
            </div>
          </div>

          {current.providerReference && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/60">
              <span>Invoice Ref:</span>
              <button
                type="button"
                onClick={copyReference}
                className="inline-flex items-center gap-1 font-mono text-foreground hover:underline cursor-pointer"
                title="Copy reference"
              >
                {current.providerReference}
                <Copy className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Dynamic Status Body */}
        {isPaid ? (
          <div className="flex flex-col items-center text-center py-6 space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30 px-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            <div>
              <p className="font-semibold text-base text-emerald-900 dark:text-emerald-200">
                Payment Confirmed
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                Your transaction has been verified via Bakong and your course access is now active.
              </p>
            </div>
          </div>
        ) : isExpired || isFailed ? (
          <div className="flex flex-col items-center text-center py-6 space-y-3 rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-900 dark:bg-amber-950/30 px-4">
            <AlertTriangle className="h-10 w-10 text-amber-600" />
            <div>
              <p className="font-semibold text-sm text-foreground">
                {isExpired ? "KHQR Payment Expired" : `Payment ${current.status}`}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {isExpired
                  ? "This dynamic KHQR code has expired. Generate a fresh QR code to complete checkout."
                  : "This transaction cannot be completed. Please generate a new Bakong QR code."}
              </p>
            </div>
            {onRegenerate && (
              <Button
                size="sm"
                className="gap-1.5"
                disabled={isRegenerating}
                onClick={onRegenerate}
              >
                {isRegenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RefreshCw className="h-3.5 w-3.5" />
                )}
                Generate New KHQR
              </Button>
            )}
          </div>
        ) : current.qrCode ? (
          <div className="flex flex-col items-center space-y-3 py-2">
            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <QRCodeSVG value={current.qrCode} size={220} level="M" includeMargin={false} />
            </div>

            <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground">
              {remainingSeconds != null && (
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  Expires in {formatCountdown(remainingSeconds)}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Checking every 3s
              </span>
            </div>

            {current.deepLink && (
              <Button type="button" variant="outline" size="sm" className="w-full gap-1.5" asChild>
                <a href={current.deepLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open Bakong Payment Link
                </a>
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-6 space-y-3 rounded-xl border border-border bg-muted/30 px-4">
            <QrCode className="h-10 w-10 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">No active KHQR payload on this invoice.</p>
            {onRegenerate && (
              <Button size="sm" onClick={onRegenerate} disabled={isRegenerating}>
                Generate KHQR
              </Button>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {!isPaid && !isExpired && !isFailed && (
            <Button
              type="button"
              variant="secondary"
              className="gap-1.5"
              disabled={statusQuery.isFetching}
              onClick={() => statusQuery.refetch()}
            >
              {statusQuery.isFetching ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              {statusQuery.isFetching ? "Checking..." : "I've Paid • Verify"}
            </Button>
          )}
          <Button
            type="button"
            variant={isPaid ? "default" : "outline"}
            onClick={() => onOpenChange(false)}
          >
            {isPaid ? "Done" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
