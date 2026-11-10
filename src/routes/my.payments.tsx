import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { SiteHeader } from "@/components/SiteHeader";
import { RequireAuth } from "@/components/RequireRole";
import { ApiAlert } from "@/components/ApiAlert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Clock, QrCode, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { BakongPaymentDialog, type BakongPaymentRecord } from "@/components/BakongPaymentDialog";

export const Route = createFileRoute("/my/payments")({
  head: () => ({ meta: [{ title: "My payments — Lumen LMS" }] }),
  component: () => <RequireAuth><Page /></RequireAuth>,
});

function statusVariant(s: string): "default" | "secondary" | "destructive" | "outline" {
  if (s === "PAID") return "default";
  if (s === "PENDING") return "secondary";
  if (s === "FAILED") return "destructive";
  return "outline";
}

function Page() {
  const qc = useQueryClient();
  const [selectedPayment, setSelectedPayment] = useState<BakongPaymentRecord | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, error } = useQuery<any[]>({
    queryKey: ["my-payments"],
    queryFn: () => api("/api/payments/me"),
  });

  const regenerateMutation = useMutation({
    mutationFn: (courseId: number) =>
      api<BakongPaymentRecord>("/api/payments/checkout", {
        method: "POST",
        body: { courseId, provider: "BAKONG_KHQR" },
        auth: true,
      }),
    onSuccess: (payment) => {
      qc.invalidateQueries({ queryKey: ["my-payments"] });
      setSelectedPayment(payment);
      setDialogOpen(true);
    },
    onError: (e: any) => toast.error(e?.message || "Failed to generate Bakong KHQR"),
  });

  const hasPending = data?.some((p: any) => p.status === "PENDING");

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-10">
        <h1 className="mb-2 text-2xl font-semibold text-foreground">My payments</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Review your course transactions and Bakong KHQR payment statuses.
        </p>

        {hasPending && (
          <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3.5 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2">
            <Clock className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Pending Payment</p>
              <p>You have pending Bakong transaction(s). Open a pending invoice to view the KHQR code or verify completion.</p>
            </div>
          </div>
        )}

        <ApiAlert error={error} />
        {isLoading ? <Skeleton className="h-64 w-full" /> : !data || data.length === 0 ? (
          <p className="text-muted-foreground">No payments yet.</p>
        ) : (
          <div className="rounded-md border border-border bg-card overflow-x-auto">
            <Table>
              <TableHeader><TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {data.map((p: any) => (
                  <TableRow key={p.paymentId || p.id}>
                    <TableCell className="font-medium">{p.courseTitle || `#${p.courseId}`}</TableCell>
                    <TableCell>${Number(p.amount ?? 0).toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {p.provider || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{p.providerReference || "—"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={statusVariant(p.status)}
                        className={
                          p.status === "PAID"
                            ? "bg-emerald-600 text-white"
                            : p.status === "PENDING"
                            ? "bg-amber-100 text-amber-800 border-amber-300"
                            : p.status === "EXPIRED"
                            ? "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300"
                            : ""
                        }
                      >
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.status === "PAID" ? (
                        <Button size="sm" variant="outline" asChild className="h-7 text-xs gap-1">
                          <Link to="/courses/$id" params={{ id: String(p.courseId) }}>
                            <BookOpen className="h-3 w-3" /> Go to Course
                          </Link>
                        </Button>
                      ) : p.status === "PENDING" && p.qrCode ? (
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 text-xs gap-1 bg-[#005a87] hover:bg-[#00476a] text-white"
                          onClick={() => {
                            setSelectedPayment(p);
                            setDialogOpen(true);
                          }}
                        >
                          <QrCode className="h-3 w-3" /> Pay / Check QR
                        </Button>
                      ) : p.status === "PENDING" || p.status === "EXPIRED" ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs gap-1"
                          disabled={regenerateMutation.isPending}
                          onClick={() => regenerateMutation.mutate(p.courseId)}
                        >
                          <RefreshCw className="h-3 w-3" /> Pay with Bakong
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <BakongPaymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        payment={selectedPayment}
        isRegenerating={regenerateMutation.isPending}
        onRegenerate={() => {
          if (selectedPayment?.courseId) {
            regenerateMutation.mutate(selectedPayment.courseId);
          }
        }}
      />
    </div>
  );
}
