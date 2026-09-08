import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api, mediaUrl } from "@/lib/api";
import { SiteHeader } from "@/components/SiteHeader";
import { RequireRole } from "@/components/RequireRole";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ApiAlert } from "@/components/ApiAlert";
import { CrudPanel } from "@/components/CrudPanel";
import { MultiSelect } from "@/components/MultiSelect";
import { SelectFetch } from "@/components/SelectFetch";
import { toast } from "sonner";
import {
  LayoutDashboard,
  BarChart3,
  BookOpen,
  FolderTree,
  Layers,
  FileVideo,
  ListChecks,
  HelpCircle,
  CheckSquare,
  CreditCard,
  Users,
  UserCheck,
  UserPlus,
  Shield,
  Plus,
  Trash2,
  Upload,
  Check,
  FileText,
  Search,
  RefreshCw,
  DollarSign,
  Award,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Percent,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Admin Console — Lumen LMS" }] }),
  component: () => (
    <RequireRole roles={["ADMIN"]}>
      <AdminPage />
    </RequireRole>
  ),
});

type Section =
  | "overview"
  | "analytics"
  | "users"
  | "courses"
  | "enrollments"
  | "payments"
  | "categories"
  | "sections"
  | "lessons"
  | "assignments"
  | "quizzes"
  | "questions"
  | "answers";

interface NavGroup {
  label: string;
  items: { key: Section; label: string; icon: any; badge?: string | number }[];
}

interface AdminDashboardDTO {
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  grossRevenue: number;
  totalQuizzes: number;
  totalAssignments: number;
}

interface MonthlyEnrollmentDTO {
  month: string;
  enrollmentCount: number;
  newLearnersCount: number;
}

interface CourseEnrollmentDTO {
  courseId: number;
  courseTitle: string;
  totalEnrolled: number;
  activeStudents: number;
  completedStudents: number;
}

interface EnrollmentReportDTO {
  totalEnrollments: number;
  monthlyBreakdown: MonthlyEnrollmentDTO[];
  courseBreakdown: CourseEnrollmentDTO[];
}

interface CourseProgressReportDTO {
  courseId: number;
  courseTitle: string;
  enrolledStudents: number;
  averageProgressPercent: number;
  completionRate: number;
  averageQuizScore: number;
}

interface ProgressReportDTO {
  totalStudentsEnrolled: number;
  overallCompletionRate: number;
  overallAverageQuizScore: number;
  assignmentSubmissionRate: number;
  courseProgressList: CourseProgressReportDTO[];
}

interface QuizSummaryReportDTO {
  quizId: number;
  quizTitle: string;
  totalAttempts: number;
  averageScore: number;
  passRate: number;
}

interface QuizReportDTO {
  totalQuizzes: number;
  overallPassRate: number;
  averageScore: number;
  quizSummaries: QuizSummaryReportDTO[];
}

function AdminPage() {
  const [section, setSection] = useState<Section>("overview");

  // Optional badge counts from lightweight queries
  const pendingPaymentsQuery = useQuery<any[]>({
    queryKey: ["admin-payments"],
    queryFn: () => api("/api/payments"),
    staleTime: 30000,
  });
  const pendingCount = pendingPaymentsQuery.data?.filter((p) => p.status === "PENDING").length || 0;

  const navGroups: NavGroup[] = [
    {
      label: "Platform",
      items: [
        { key: "overview", label: "Overview", icon: LayoutDashboard },
        { key: "analytics", label: "Reports & Analytics", icon: BarChart3 },
      ],
    },
    {
      label: "Management",
      items: [
        { key: "users", label: "Users & Roles", icon: Users },
        { key: "courses", label: "Courses Catalog", icon: BookOpen },
        { key: "enrollments", label: "Enrollments", icon: GraduationCap },
        { key: "payments", label: "Financials", icon: CreditCard, badge: pendingCount > 0 ? pendingCount : undefined },
      ],
    },
    {
      label: "Curriculum",
      items: [
        { key: "categories", label: "Categories", icon: FolderTree },
        { key: "sections", label: "Sections", icon: Layers },
        { key: "lessons", label: "Lessons", icon: FileVideo },
        { key: "assignments", label: "Assignments", icon: FileText },
        { key: "quizzes", label: "Quizzes", icon: ListChecks },
        { key: "questions", label: "Questions", icon: HelpCircle },
        { key: "answers", label: "Answers", icon: CheckSquare },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader hideNav />
      <div className="container mx-auto flex flex-col md:flex-row gap-6 px-3 sm:px-6 py-4 sm:py-8">
        {/* Mobile Navigation Header & Tab Scroller */}
        <div className="block md:hidden space-y-2.5">
          <div className="flex items-center justify-between rounded-lg border border-border bg-card p-2.5 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Workspace:</span>
              <span className="text-xs font-bold text-foreground">
                {navGroups.flatMap((g) => g.items).find((i) => i.key === section)?.label || "Overview"}
              </span>
            </div>
            <select
              aria-label="Select admin workspace tab"
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="h-8 rounded-md border border-input bg-background px-2 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {navGroups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.items.map((it) => (
                    <option key={it.key} value={it.key}>
                      {it.label} {it.badge ? `(${it.badge})` : ""}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* Swipeable horizontal pill carousel for instant tab switching */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1">
            {navGroups
              .flatMap((g) => g.items)
              .map((it) => {
                const Icon = it.icon;
                const active = section === it.key;
                return (
                  <button
                    key={it.key}
                    onClick={() => setSection(it.key)}
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                        : "border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{it.label}</span>
                    {it.badge && (
                      <span
                        className={`rounded-full px-1.5 text-[9px] font-bold ${
                          active
                            ? "bg-primary-foreground text-primary"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {it.badge}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Sidebar Navigation */}
        <aside className="hidden w-60 shrink-0 md:block">
          <div className="sticky top-20 space-y-6">
            <div className="rounded-lg border border-border bg-card p-3 shadow-xs">
              <div className="flex items-center gap-2 px-2 py-1 mb-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin Workspace</span>
              </div>
              <div className="space-y-4">
                {navGroups.map((group) => (
                  <div key={group.label} className="space-y-1">
                    <p className="px-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
                      {group.label}
                    </p>
                    {group.items.map((it) => {
                      const Icon = it.icon;
                      const active = section === it.key;
                      return (
                        <button
                          key={it.key}
                          onClick={() => setSection(it.key)}
                          className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                            active
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <Icon className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{it.label}</span>
                          </div>
                          {it.badge && (
                            <span
                              className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                                active
                                  ? "bg-primary-foreground text-primary"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              }`}
                            >
                              {it.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {section === "overview" && <Overview onNavigate={setSection} />}
          {section === "analytics" && <AnalyticsReports />}
          {section === "courses" && <AdminCourses />}
          {section === "categories" && (
            <CrudPanel
              cfg={{
                resource: "categories",
                title: "Categories",
                queryKey: "admin-categories",
                fields: [{ name: "category", label: "Category Name" }],
                columns: [
                  { key: "categoryId", label: "ID" },
                  { key: "category", label: "Name" },
                ],
                emptyForm: { category: "" },
              }}
            />
          )}
          {section === "sections" && <SectionPanel />}
          {section === "lessons" && <AdminLessons />}
          {section === "assignments" && <AdminAssignments />}
          {section === "quizzes" && <QuizPanel />}
          {section === "questions" && <QuestionPanel />}
          {section === "answers" && <AnswerPanel />}
          {section === "payments" && <AdminPayments />}
          {section === "enrollments" && <AdminEnrollments />}
          {section === "users" && <AdminUsers />}
        </main>
      </div>
    </div>
  );
}

function Overview({ onNavigate }: { onNavigate: (sec: Section) => void }) {
  const qc = useQueryClient();
  const {
    data: dashboard,
    isLoading: dashLoading,
    error: dashError,
    refetch,
    isRefetching,
  } = useQuery<AdminDashboardDTO>({
    queryKey: ["admin-dashboard"],
    queryFn: () => api<AdminDashboardDTO>("/api/dashboard/admin"),
  });

  const paymentsQuery = useQuery<any[]>({
    queryKey: ["admin-payments"],
    queryFn: () => api("/api/payments"),
  });

  const enrollmentsQuery = useQuery<any[]>({
    queryKey: ["admin-enrollments"],
    queryFn: () => api("/api/enrollments"),
  });

  const grossRev = Number(dashboard?.grossRevenue ?? 0);
  const completionRate = Number(dashboard?.completionRate ?? 0);

  const kpis = [
    {
      label: "Gross Revenue",
      value: `$${grossRev.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtext: "Total collected across platform",
      icon: DollarSign,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      label: "Total Students",
      value: dashboard?.totalStudents ?? 0,
      subtext: `${dashboard?.totalInstructors ?? 0} instructors active`,
      icon: Users,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      label: "Active Courses",
      value: dashboard?.totalCourses ?? 0,
      subtext: "Published learning tracks",
      icon: BookOpen,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400",
    },
    {
      label: "Total Enrollments",
      value: dashboard?.totalEnrollments ?? 0,
      subtext: `${dashboard?.completedEnrollments ?? 0} completions recorded`,
      icon: GraduationCap,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400",
    },
    {
      label: "Completion Rate",
      value: `${completionRate.toFixed(1)}%`,
      subtext: `${dashboard?.completedEnrollments ?? 0} of ${dashboard?.totalEnrollments ?? 0} learners`,
      icon: TrendingUp,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
      progress: completionRate,
    },
    {
      label: "Assessments Load",
      value: (dashboard?.totalQuizzes ?? 0) + (dashboard?.totalAssignments ?? 0),
      subtext: `${dashboard?.totalQuizzes ?? 0} quizzes · ${dashboard?.totalAssignments ?? 0} assignments`,
      icon: ListChecks,
      color: "text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Platform Executive Overview</h1>
          <p className="text-xs text-muted-foreground">
            Real-time telemetry and operational metrics from your Spring Boot services.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => {
              refetch();
              paymentsQuery.refetch();
              enrollmentsQuery.refetch();
            }}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            Sync Data
          </Button>
          <Button
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium"
            onClick={() => onNavigate("analytics")}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Detailed Reports
          </Button>
        </div>
      </div>

      <ApiAlert error={dashError} />

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dashLoading
          ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-lg" />)
          : kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <Card key={kpi.label} className="border-border/80 shadow-xs">
                  <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
                    <p className="text-xs font-medium text-muted-foreground">{kpi.label}</p>
                    <div className={`rounded-md p-1.5 ${kpi.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 pb-4">
                    <div className="text-2xl font-bold tracking-tight text-foreground">{kpi.value}</div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{kpi.subtext}</p>
                    {typeof kpi.progress === "number" && (
                      <div className="mt-2">
                        <Progress value={Math.min(100, Math.max(0, kpi.progress))} className="h-1.5" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {/* Quick Platform Shortcuts */}
      <div className="rounded-lg border border-border bg-card p-4 shadow-xs">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Operational Actions
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <Button
            variant="outline"
            size="sm"
            className="h-9 justify-start gap-2 text-xs font-medium hover:border-primary/50"
            onClick={() => onNavigate("users")}
          >
            <UserPlus className="h-3.5 w-3.5 text-primary" />
            Provision User
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 justify-start gap-2 text-xs font-medium hover:border-primary/50"
            onClick={() => onNavigate("courses")}
          >
            <Plus className="h-3.5 w-3.5 text-primary" />
            Create Course
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 justify-start gap-2 text-xs font-medium hover:border-primary/50"
            onClick={() => onNavigate("enrollments")}
          >
            <GraduationCap className="h-3.5 w-3.5 text-primary" />
            Enroll Learner
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 justify-start gap-2 text-xs font-medium hover:border-primary/50"
            onClick={() => onNavigate("payments")}
          >
            <CreditCard className="h-3.5 w-3.5 text-primary" />
            Audit Transactions
          </Button>
        </div>
      </div>

      {/* Live Activity Feeds */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Recent Payments Feed */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-border/50">
            <div>
              <CardTitle className="text-sm font-semibold">Recent Financial Transactions</CardTitle>
              <CardDescription className="text-[11px]">Latest ABA PayWay & gateway events</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-primary font-medium px-2"
              onClick={() => onNavigate("payments")}
            >
              View all <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {paymentsQuery.isLoading ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
              </div>
            ) : !paymentsQuery.data || paymentsQuery.data.length === 0 ? (
              <p className="p-6 text-center text-xs text-muted-foreground">No payments recorded yet.</p>
            ) : (
              <div className="divide-y divide-border/50">
                {paymentsQuery.data.slice(0, 5).map((p: any) => (
                  <div key={p.paymentId || p.id} className="flex items-center justify-between px-4 py-2.5 text-xs">
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-medium truncate text-foreground">{p.username || p.userEmail || "Learner"}</span>
                      <span className="text-[11px] text-muted-foreground truncate">{p.courseTitle || `Course #${p.courseId}`}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-semibold">${Number(p.amount ?? 0).toFixed(2)}</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium ${
                          p.status === "PAID"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                            : p.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                            : "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300"
                        }`}
                      >
                        {p.status || "PENDING"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Enrollments Feed */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-border/50">
            <div>
              <CardTitle className="text-sm font-semibold">Latest Course Enrollments</CardTitle>
              <CardDescription className="text-[11px]">Recent learner access admissions</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-primary font-medium px-2"
              onClick={() => onNavigate("enrollments")}
            >
              View all <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {enrollmentsQuery.isLoading ? (
              <div className="p-4 space-y-2">
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
                <Skeleton className="h-8" />
              </div>
            ) : !enrollmentsQuery.data || enrollmentsQuery.data.length === 0 ? (
              <p className="p-6 text-center text-xs text-muted-foreground">No active enrollments found.</p>
            ) : (
              <div className="divide-y divide-border/50">
                {enrollmentsQuery.data.slice(0, 5).map((e: any) => (
                  <div key={e.enrollmentId} className="flex items-center justify-between px-4 py-2.5 text-xs">
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-medium truncate text-foreground">{e.username || e.userEmail || `User #${e.userId}`}</span>
                      <span className="text-[11px] text-muted-foreground truncate">{e.courseTitle || `Course #${e.courseId}`}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-medium ${
                          e.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                            : e.status === "COMPLETED"
                            ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {e.status}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AnalyticsReports() {
  const enrollmentsReport = useQuery<EnrollmentReportDTO>({
    queryKey: ["report-enrollments"],
    queryFn: () => api<EnrollmentReportDTO>("/api/reports/enrollments"),
  });

  const progressReport = useQuery<ProgressReportDTO>({
    queryKey: ["report-progress"],
    queryFn: () => api<ProgressReportDTO>("/api/reports/progress"),
  });

  const quizReport = useQuery<QuizReportDTO>({
    queryKey: ["report-quizzes"],
    queryFn: () => api<QuizReportDTO>("/api/reports/quizzes"),
  });

  const isLoading = enrollmentsReport.isLoading || progressReport.isLoading || quizReport.isLoading;
  const error = enrollmentsReport.error || progressReport.error || quizReport.error;

  const maxMonthEnrollments = Math.max(
    ...(enrollmentsReport.data?.monthlyBreakdown?.map((m) => m.enrollmentCount) || [1]),
    1
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Analytics & System Reporting</h1>
        <p className="text-xs text-muted-foreground">
          Detailed telemetry on enrollment velocity, learner retention, course completion, and assessment scores.
        </p>
      </div>

      <ApiAlert error={error} />

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <p className="text-xs font-medium text-muted-foreground">Overall Completion Rate</p>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-foreground">
              {Number(progressReport.data?.overallCompletionRate ?? 0).toFixed(1)}%
            </div>
            <Progress
              value={Number(progressReport.data?.overallCompletionRate ?? 0)}
              className="mt-2 h-1.5"
            />
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <p className="text-xs font-medium text-muted-foreground">Average Quiz Score</p>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-foreground">
              {Number(progressReport.data?.overallAverageQuizScore ?? 0).toFixed(1)}%
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Across all graded quizzes</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <p className="text-xs font-medium text-muted-foreground">Assignment Submission</p>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-foreground">
              {Number(progressReport.data?.assignmentSubmissionRate ?? 0).toFixed(1)}%
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">Timely assignment turn-in rate</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4 px-4">
            <p className="text-xs font-medium text-muted-foreground">Quiz Pass Rate</p>
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold text-foreground">
              {Number(quizReport.data?.overallPassRate ?? 0).toFixed(1)}%
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {quizReport.data?.totalQuizzes ?? 0} active quizzes tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Enrollment Velocity */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="py-3 px-4 border-b border-border/50">
          <CardTitle className="text-sm font-semibold">Monthly Enrollment Velocity</CardTitle>
          <CardDescription className="text-[11px]">
            Total enrollments vs new learners per month
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <Skeleton className="h-36" />
          ) : !enrollmentsReport.data?.monthlyBreakdown?.length ? (
            <p className="text-center py-6 text-xs text-muted-foreground">
              No historical enrollment telemetry available yet.
            </p>
          ) : (
            <div className="space-y-3">
              {enrollmentsReport.data.monthlyBreakdown.map((m) => {
                const pct = Math.round((m.enrollmentCount / maxMonthEnrollments) * 100);
                return (
                  <div key={m.month} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{m.month}</span>
                      <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                        <span>{m.enrollmentCount} enrollments</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                          +{m.newLearnersCount} new
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden flex">
                      <div
                        className="bg-primary transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Course Completion Leaderboard */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="py-3 px-4 border-b border-border/50">
          <CardTitle className="text-sm font-semibold">Course Progress & Completion Leaderboard</CardTitle>
          <CardDescription className="text-[11px]">
            Aggregated performance and average quiz scores across course offerings
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-4 space-y-2">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : !progressReport.data?.courseProgressList?.length ? (
            <p className="text-center py-6 text-xs text-muted-foreground">
              No course progress records generated yet.
            </p>
          ) : (
            <div className="rounded-b-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Enrolled Learners</TableHead>
                    <TableHead className="w-48">Average Progress</TableHead>
                    <TableHead>Completion Rate</TableHead>
                    <TableHead className="text-right">Average Quiz Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {progressReport.data.courseProgressList.map((cp) => (
                    <TableRow key={cp.courseId}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {cp.courseTitle || `Course #${cp.courseId}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {cp.enrolledStudents} students
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={Number(cp.averageProgressPercent ?? 0)}
                            className="h-1.5 flex-1"
                          />
                          <span className="text-xs font-semibold w-10 text-right">
                            {Number(cp.averageProgressPercent ?? 0).toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {Number(cp.completionRate ?? 0).toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium text-xs">
                        {cp.averageQuizScore != null ? `${Number(cp.averageQuizScore).toFixed(1)}%` : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quiz Diagnostics */}
      {quizReport.data?.quizSummaries && quizReport.data.quizSummaries.length > 0 && (
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="py-3 px-4 border-b border-border/50">
            <CardTitle className="text-sm font-semibold">Quiz Assessment Diagnostics</CardTitle>
            <CardDescription className="text-[11px]">
              Pass rates and average scores per evaluation module
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-b-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quiz</TableHead>
                    <TableHead>Total Attempts</TableHead>
                    <TableHead>Average Score</TableHead>
                    <TableHead className="text-right">Pass Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quizReport.data.quizSummaries.map((q) => (
                    <TableRow key={q.quizId}>
                      <TableCell className="font-medium text-xs">
                        {q.quizTitle || `Quiz #${q.quizId}`}
                      </TableCell>
                      <TableCell className="text-xs">{q.totalAttempts}</TableCell>
                      <TableCell className="text-xs font-semibold">
                        {Number(q.averageScore ?? 0).toFixed(1)}%
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={`text-xs font-semibold ${
                            (q.passRate ?? 0) >= 70
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                              : (q.passRate ?? 0) >= 50
                              ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                              : "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300"
                          }`}
                        >
                          {Number(q.passRate ?? 0).toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AdminCourses() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data, isLoading, error } = useQuery<any[]>({
    queryKey: ["admin-courses"],
    queryFn: () => api("/api/courses", { auth: false }),
  });

  const del = useMutation({
    mutationFn: (courseId: number) => api(`/api/courses/${courseId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Course deleted");
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const toggleStatus = useMutation({
    mutationFn: ({ courseId, status }: { courseId: number; status: string }) =>
      api(`/api/courses/${courseId}/status`, {
        method: "PATCH",
        body: { status },
      }),
    onSuccess: (updated: any) => {
      toast.success(`Course #${updated.courseId} status updated to ${updated.status}`);
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to update status"),
  });

  const allCourses = data || [];
  const publishedCount = allCourses.filter((c) => c.status === "PUBLISHED").length;
  const draftCount = allCourses.filter((c) => c.status === "DRAFT").length;
  const archivedCount = allCourses.filter((c) => c.status === "ARCHIVED").length;

  const filteredCourses = allCourses.filter((c) => {
    const matchesStatus = statusFilter === "ALL" ? true : c.status === statusFilter;
    if (!matchesStatus) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.title && c.title.toLowerCase().includes(q)) ||
      (c.instructor && c.instructor.toLowerCase().includes(q)) ||
      (c.categories && c.categories.some((cat: string) => cat.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">Course Catalog & Governance</h2>
          <p className="text-xs text-muted-foreground">
            Manage course lifecycle, publication status, pricing, and curriculum content.
          </p>
        </div>
        <CourseDialog mode="create" onSaved={() => qc.invalidateQueries({ queryKey: ["admin-courses"] })} />
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: "ALL", label: "All Courses", count: allCourses.length },
            { key: "PUBLISHED", label: "Published", count: publishedCount },
            { key: "DRAFT", label: "Drafts", count: draftCount },
            { key: "ARCHIVED", label: "Archived", count: archivedCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter === tab.key
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] opacity-80">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by title, instructor, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <ApiAlert error={error} />

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card shadow-xs overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Categories</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="w-36">Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-xs text-muted-foreground">
                    No courses found matching the filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((c: any) => (
                  <TableRow key={c.courseId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img
                          src={mediaUrl(c.coverUrl || c.coverDir)}
                          alt=""
                          className="h-10 w-14 rounded-md object-cover border border-border shrink-0 bg-muted"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <div className="flex flex-col min-w-0 max-w-[220px]">
                          <span className="font-semibold text-xs text-foreground truncate">{c.title}</span>
                          <span className="text-[10px] text-muted-foreground">
                            ID #{c.courseId} · {c.overallDuration || "No duration"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {c.categories && c.categories.length > 0 ? (
                          c.categories.map((cat: string) => (
                            <Badge key={cat} variant="secondary" className="text-[10px] py-0 px-1.5 font-normal">
                              {cat}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-[10px] uppercase font-medium">
                        {c.level ? c.level.replace("_", " ") : "ALL LEVELS"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <Select
                        value={c.status || "PUBLISHED"}
                        onValueChange={(v) => toggleStatus.mutate({ courseId: c.courseId, status: v })}
                        disabled={toggleStatus.isPending}
                      >
                        <SelectTrigger className="h-7 text-xs w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PUBLISHED" className="text-xs">
                            Published
                          </SelectItem>
                          <SelectItem value="DRAFT" className="text-xs">
                            Draft
                          </SelectItem>
                          <SelectItem value="ARCHIVED" className="text-xs">
                            Archived
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell className="font-semibold text-xs">
                      {Number(c.price ?? 0) === 0 ? "Free" : `$${Number(c.price).toFixed(2)}`}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">
                      {c.instructor || "—"}
                    </TableCell>

                    <TableCell className="text-xs whitespace-nowrap">
                      {c.rating != null && c.rating > 0 ? `⭐ ${Number(c.rating).toFixed(1)}` : "—"}
                    </TableCell>

                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <CourseDialog
                          mode="edit"
                          initial={c}
                          onSaved={() => qc.invalidateQueries({ queryKey: ["admin-courses"] })}
                        />
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (confirm(`Delete course "${c.title}" (#${c.courseId})?`)) {
                              del.mutate(c.courseId);
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function CourseDialog({ mode, initial, onSaved }: { mode: "create" | "edit"; initial?: any; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(() => initial || { title: "", description: "", price: 0, overallDuration: "", coverUrl: "", coverPublicId: "", coverDir: "", instructor: 1, categoryId: [] });
  const [error, setError] = useState<unknown>(null);
  const [uploading, setUploading] = useState(false);
  const { data: categories, isLoading: catsLoading } = useQuery<any[]>({
    queryKey: ["admin-categories"],
    queryFn: () => api("/api/categories"),
  });

  async function uploadCover(file: File) {
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await api<any>("/api/uploads/course-cover", { method: "POST", formData: fd });
      setForm((f: any) => ({ ...f, coverUrl: res.url, coverPublicId: res.publicId, coverDir: res.url }));
    } catch (e) { setError(e); } finally { setUploading(false); }
  }

  const save = useMutation({
    mutationFn: () => {
      const body = { ...form };
      if (mode === "create") return api("/api/courses", { method: "POST", body });
      const courseId = initial.courseId || initial.id;
      return api(`/api/courses/${courseId}`, { method: "PUT", body });
    },
    onSuccess: () => { toast.success("Saved"); setOpen(false); onSaved(); },
    onError: (e) => setError(e),
  });

  const catOptions =
      categories?.map((c) => ({
        id: c.categoryId,
        label: c.category?.toLowerCase(),
      })) || [];

  return (
    <Dialog open={open}
        onOpenChange={(o) => { setOpen(o); if (o) { setForm(
          initial
              ? {
                ...initial,
                coverUrl: initial.coverUrl ?? initial.coverDir ?? "",
                coverPublicId: initial.coverPublicId ?? "",
                coverDir: initial.coverUrl ?? initial.coverDir ?? "",
                categoryId:
                    initial.categories?.map(
                        (cat: any) => {
                          const found = categories?.find(
                              (c) =>
                                  c.category === cat
                          );

                          return found?.categoryId;
                        }
                    ).filter(Boolean) || [],
                level: initial.level || "ALL_LEVELS",
                status: initial.status || "PUBLISHED",
                learningOutcomes: initial.learningOutcomes || "",
                requirements: initial.requirements || "",
              }
              : {
                title: "",
                description: "",
                price: 0,
                overallDuration: "",
                coverUrl: "",
                coverPublicId: "",
                coverDir: "",
                instructor: 1,
                categoryId: [],
                level: "ALL_LEVELS",
                status: "PUBLISHED",
                learningOutcomes: "",
                requirements: "",
              }
          );
          }
        }
      }
    >
      <DialogTrigger asChild>{mode === "create" ? <Button size="sm"><Plus className="mr-1 h-4 w-4" />New course</Button> : <Button size="icon" variant="ghost"><LayoutDashboard className="h-4 w-4" /></Button>}</DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{mode === "create" ? "New course" : "Edit course"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <ApiAlert error={error} />
          <div className="space-y-1"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-1"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label>Price</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} /></div>
            <div className="space-y-1"><Label>Duration</Label><Input value={form.overallDuration} onChange={(e) => setForm({ ...form, overallDuration: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Level</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={form.level || "ALL_LEVELS"}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
              >
                <option value="ALL_LEVELS">All Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <select
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                value={form.status || "PUBLISHED"}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Learning Outcomes</Label>
            <Textarea
              placeholder="What students will learn..."
              value={form.learningOutcomes || ""}
              onChange={(e) => setForm({ ...form, learningOutcomes: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label>Requirements</Label>
            <Textarea
              placeholder="Course prerequisites..."
              value={form.requirements || ""}
              onChange={(e) => setForm({ ...form, requirements: e.target.value })}
            />
          </div>
          <div className="space-y-1"><Label>Instructor ID</Label><Input type="number" value={form.instructorId || form.instructor || ""} onChange={(e) => setForm({ ...form, instructor: parseInt(e.target.value) || null })} /></div>
          <div className="space-y-1"><Label>Categories</Label>{catsLoading ? <Skeleton className="h-10" /> : <MultiSelect options={catOptions} selected={form.categoryId||[]} onChange={(ids) => setForm({ ...form, categoryId: ids })} placeholder="Select categories..." />}</div>
          <div className="space-y-1">
            <Label>Cover</Label>
            <div className="flex items-center gap-2">
              <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadCover(e.target.files[0])} />
              {uploading && <Upload className="h-4 w-4 animate-pulse" />}
            </div>
            {(form.coverUrl || form.coverDir) && <img src={mediaUrl(form.coverUrl || form.coverDir)} alt="cover" className="mt-2 h-24 rounded object-cover" />}
          </div>
        </div>
        <DialogFooter><Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Saving..." : "Save"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AdminLessons() {
  const qc = useQueryClient();
  const list = useQuery<any[]>({ queryKey: ["admin-lessons"], queryFn: () => api("/api/lessons") });
  const { data: sections } = useQuery<any[]>({ queryKey: ["admin-sections"], queryFn: () => api("/api/sections") });
  const del = useMutation({ mutationFn: (lessonId: number) => api(`/api/lessons/${lessonId}`, { method: "DELETE" }), onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-lessons"] }); } });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Lessons</h2><LessonDialog sections={sections || []} mode="create" onSaved={() => qc.invalidateQueries({ queryKey: ["admin-lessons"] })} /></div>
      <ApiAlert error={list.error} />
      {list.isLoading ? <Skeleton className="h-40" /> : (
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Title</TableHead><TableHead>Section</TableHead><TableHead>Video</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {list.data?.map((l: any) => (
                <TableRow key={l.lessonId}>
                  <TableCell>{l.lessonId}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{l.title}</span>
                      {l.isFree && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-300 shrink-0">
                          Free Trial
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{l.sectionName || `Section #${l.sectionId}`}</TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                    {(l.videoUrl || l.videoDir) && <video src={mediaUrl(l.videoUrl || l.videoDir)} width={"100px"} controls/>}
                  </TableCell>
                  <TableCell className="space-x-1 text-right">
                    <LessonDialog sections={sections || []} mode="edit" initial={l} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-lessons"] })} />
                    <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete?")) del.mutate(l.lessonId); }}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function LessonDialog({ mode, sections,initial, onSaved }: { mode: "create" | "edit"; initial?: any; sections:any[]; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(() => initial ? {
    ...initial,
    videoUrl: initial.videoUrl ?? initial.videoDir ?? "",
    videoPublicId: initial.videoPublicId ?? "",
    videoDir: initial.videoUrl ?? initial.videoDir ?? "",
    isFree: initial.isFree ?? false,
  } : { title: "", videoUrl: "", videoPublicId: "", videoDir: "", sectionId: "", isFree: false });
  const [error, setError] = useState<unknown>(null);
  const [uploading, setUploading] = useState(false);

  async function uploadVideo(file: File) {
    setUploading(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await api<any>("/api/uploads/lesson-video", { method: "POST", formData: fd });
      setForm((f: any) => ({ ...f, videoUrl: res.url, videoPublicId: res.publicId, videoDir: res.url }));
      toast.success("Video uploaded");
    } catch (e) { setError(e); } finally { setUploading(false); }
  }

  const save = useMutation({
    mutationFn: () => {
      const body = { ...form, sectionId: Number(form.sectionId) };
      if (mode === "create") return api("/api/lessons", { method: "POST", body });
      return api(`/api/lessons/${initial.lessonId}`, { method: "PUT", body });
    },
    onSuccess: () => { toast.success("Saved"); setOpen(false); onSaved(); },
    onError: (e) => setError(e),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) { setForm(initial ? {
      ...initial,
      videoUrl: initial.videoUrl ?? initial.videoDir ?? "",
      videoPublicId: initial.videoPublicId ?? "",
      videoDir: initial.videoUrl ?? initial.videoDir ?? "",
      orderIndex: initial.orderIndex ?? 0,
      duration: initial.duration ?? "",
      description: initial.description ?? "",
      textContent: initial.textContent ?? "",
      isFree: initial.isFree ?? false,
    } : {
      title: "",
      videoUrl: "",
      videoPublicId: "",
      videoDir: "",
      sectionId: "",
      orderIndex: 0,
      duration: "",
      description: "",
      textContent: "",
      isFree: false,
    }); setError(null); } }}>
      <DialogTrigger asChild>{mode === "create" ? <Button size="sm"><Plus className="mr-1 h-4 w-4" />New lesson</Button> : <Button size="icon" variant="ghost"><FileVideo className="h-4 w-4" /></Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader><DialogTitle>{mode === "create" ? "New lesson" : "Edit lesson"}</DialogTitle></DialogHeader>
        <div className="space-y-3 max-h-[70vh] overflow-y-auto px-1">
          <ApiAlert error={error} />
          <div className="space-y-1"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-1"><Label>Section</Label>
            <Select value={String(form.sectionId)} onValueChange={(v) => setForm({ ...form, sectionId: parseInt(v) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{sections.map((s) => <SelectItem key={s.sectionId} value={String(s.sectionId)}>{s.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Order Index</Label>
              <Input type="number" value={form.orderIndex ?? 0} onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="space-y-1">
              <Label>Duration</Label>
              <Input placeholder="e.g. 15:30" value={form.duration ?? ""} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1"><Label>Video</Label>
            <div className="flex items-center gap-2"><Input type="file" accept="video/*" onChange={(e) => e.target.files?.[0] && uploadVideo(e.target.files[0])} />{uploading && <Upload className="h-4 w-4 animate-pulse" />}</div>
            {(form.videoUrl || form.videoDir) && <p className="text-xs text-muted-foreground truncate">{form.videoUrl || form.videoDir}</p>}
          </div>
          <div className="space-y-1">
            <Label>Description</Label>
            <Textarea rows={2} placeholder="Brief description of this lesson" value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Reading Text / Notes</Label>
            <Textarea rows={3} placeholder="Supplemental text or instructions" value={form.textContent ?? ""} onChange={(e) => setForm({ ...form, textContent: e.target.value })} />
          </div>
          <div className="flex items-start space-x-2 rounded-md border p-3 bg-muted/20">
            <Checkbox
              id="adminLessonIsFree"
              checked={Boolean(form.isFree)}
              onCheckedChange={(checked) =>
                setForm({ ...form, isFree: checked === true })
              }
            />
            <div className="grid gap-1 leading-none">
              <Label htmlFor="adminLessonIsFree" className="font-medium cursor-pointer">
                Free Trial / Preview Lesson
              </Label>
              <p className="text-xs text-muted-foreground">
                Allow prospective students to watch this video without enrolling in the course.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter><Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"];

function AdminPayments() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const list = useQuery<any[]>({
    queryKey: ["admin-payments"],
    queryFn: () => api("/api/payments"),
  });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api(`/api/payments/${id}/status`, {
        method: "PATCH",
        body: { status, providerReference: "admin-confirmed" },
      }),
    onSuccess: (_, vars) => {
      if (vars.status === "PAID") {
        toast.success("Payment confirmed and student enrolled!");
      } else {
        toast.success(`Payment status updated to ${vars.status}`);
      }
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      qc.invalidateQueries({ queryKey: ["admin-enrollments"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: () => toast.error("Failed to update payment status"),
  });

  const del = useMutation({
    mutationFn: (id: number) => api(`/api/payments/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Payment record deleted");
      qc.invalidateQueries({ queryKey: ["admin-payments"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });

  const allPayments = list.data || [];
  const totalPaidVolume = allPayments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const pendingCount = allPayments.filter((p) => p.status === "PENDING").length;
  const paidCount = allPayments.filter((p) => p.status === "PAID").length;
  const failedCount = allPayments.filter((p) => p.status === "FAILED" || p.status === "REFUNDED").length;

  const filteredPayments = allPayments.filter((p) => {
    const matchesStatus = statusFilter === "ALL" ? true : p.status === statusFilter;
    if (!matchesStatus) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.username && p.username.toLowerCase().includes(q)) ||
      (p.userEmail && p.userEmail.toLowerCase().includes(q)) ||
      (p.courseTitle && p.courseTitle.toLowerCase().includes(q)) ||
      (p.providerReference && p.providerReference.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">Financial Ledger & Transactions</h2>
          <p className="text-xs text-muted-foreground">
            Audit gateway settlements, confirm ABA PayWay transactions, and track student purchase orders.
          </p>
        </div>
      </div>

      {/* Financial Snapshot Cards */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="py-2.5 px-4 flex flex-row items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Confirmed Revenue</p>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold text-foreground">
              ${totalPaidVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-muted-foreground">{paidCount} successful payments</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="py-2.5 px-4 flex flex-row items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Pending Approvals</p>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold text-foreground">{pendingCount}</div>
            <p className="text-[11px] text-muted-foreground">Awaiting manual or webhook verification</p>
          </CardContent>
        </Card>

        <Card className="border-border/80 shadow-xs">
          <CardHeader className="py-2.5 px-4 flex flex-row items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Total Invoices</p>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent className="px-4 pb-3">
            <div className="text-xl font-bold text-foreground">{allPayments.length}</div>
            <p className="text-[11px] text-muted-foreground">{failedCount} failed or refunded</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: "ALL", label: "All Transactions", count: allPayments.length },
            { key: "PENDING", label: "Pending", count: pendingCount },
            { key: "PAID", label: "Paid", count: paidCount },
            { key: "FAILED", label: "Failed / Refunded", count: failedCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter === tab.key
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] opacity-80">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by student, course, reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <ApiAlert error={list.error} />

      {list.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card shadow-xs overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Gateway</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="w-48">Status / Verification</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-xs text-muted-foreground">
                    No transactions matching the selected criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((p: any) => (
                  <TableRow
                    key={p.paymentId || p.id}
                    className={p.status === "PENDING" ? "bg-amber-50/40 dark:bg-amber-950/15" : ""}
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{p.paymentId || p.id}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="font-medium text-foreground">{p.username || "Learner"}</span>
                        <span className="text-[11px] text-muted-foreground">{p.userEmail || "—"}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs font-medium max-w-[200px] truncate">
                      {p.courseTitle || `Course #${p.courseId}`}
                    </TableCell>

                    <TableCell className="font-bold text-xs text-foreground">
                      ${Number(p.amount ?? 0).toFixed(2)}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-medium">
                        {p.provider || "ABA_PAYWAY"}
                      </Badge>
                    </TableCell>

                    <TableCell className="font-mono text-[11px] text-muted-foreground max-w-[120px] truncate">
                      {p.providerReference || "—"}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Select
                          value={p.status}
                          onValueChange={(v) => update.mutate({ id: p.paymentId || p.id, status: v })}
                          disabled={update.isPending}
                        >
                          <SelectTrigger className="w-28 h-7 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_STATUSES.map((s) => (
                              <SelectItem key={s} value={s} className="text-xs">
                                {s}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        {p.status === "PENDING" && (
                          <Button
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-[11px] gap-1 font-medium whitespace-nowrap px-2"
                            disabled={update.isPending}
                            onClick={() => update.mutate({ id: p.paymentId || p.id, status: "PAID" })}
                          >
                            <Check className="h-3 w-3" /> Confirm
                          </Button>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm("Delete payment record?")) del.mutate(p.paymentId || p.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

const ENROLL_STATUSES = ["ACTIVE", "COMPLETED", "CANCELLED"];

function AdminEnrollments() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [creating, setCreating] = useState(false);

  const [newForm, setNewForm] = useState({ userId: "", courseId: "", status: "ACTIVE" });

  const list = useQuery<any[]>({
    queryKey: ["admin-enrollments"],
    queryFn: () => api("/api/enrollments"),
  });

  const usersQuery = useQuery<any[]>({
    queryKey: ["admin-users"],
    queryFn: () => api("/api/users"),
  });

  const coursesQuery = useQuery<any[]>({
    queryKey: ["admin-courses"],
    queryFn: () => api("/api/courses", { auth: false }),
  });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api(`/api/enrollments/${id}/status`, { method: "PATCH", body: { status } }),
    onSuccess: () => {
      toast.success("Enrollment status updated");
      qc.invalidateQueries({ queryKey: ["admin-enrollments"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to update status"),
  });

  const del = useMutation({
    mutationFn: (id: number) => api(`/api/enrollments/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Enrollment deleted");
      qc.invalidateQueries({ queryKey: ["admin-enrollments"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
  });

  const create = useMutation({
    mutationFn: () =>
      api("/api/enrollments/manage", {
        method: "POST",
        body: {
          userId: Number(newForm.userId),
          courseId: Number(newForm.courseId),
          status: newForm.status,
        },
      }),
    onSuccess: () => {
      toast.success("Student enrolled successfully");
      setCreating(false);
      setNewForm({ userId: "", courseId: "", status: "ACTIVE" });
      qc.invalidateQueries({ queryKey: ["admin-enrollments"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to enroll student"),
  });

  const allEnrollments = list.data || [];
  const activeCount = allEnrollments.filter((e) => e.status === "ACTIVE").length;
  const completedCount = allEnrollments.filter((e) => e.status === "COMPLETED").length;
  const cancelledCount = allEnrollments.filter((e) => e.status === "CANCELLED").length;

  const filteredEnrollments = allEnrollments.filter((e) => {
    const matchesStatus = statusFilter === "ALL" ? true : e.status === statusFilter;
    if (!matchesStatus) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (e.username && e.username.toLowerCase().includes(q)) ||
      (e.userEmail && e.userEmail.toLowerCase().includes(q)) ||
      (e.courseTitle && e.courseTitle.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">Course Enrollments & Admissions</h2>
          <p className="text-xs text-muted-foreground">
            Directly enroll students into courses, update completion statuses, and oversee admission rosters.
          </p>
        </div>

        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1.5 text-xs font-medium">
              <Plus className="h-3.5 w-3.5" />
              Enroll Student
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Enroll Student in Course</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2 text-xs">
              <div className="space-y-1">
                <Label className="text-xs">Select Learner</Label>
                <Select
                  value={newForm.userId}
                  onValueChange={(v) => setNewForm({ ...newForm, userId: v })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Choose a registered student..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {usersQuery.data?.map((u: any) => (
                      <SelectItem key={u.id} value={String(u.id)} className="text-xs">
                        {u.fullName || u.username} ({u.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Select Course</Label>
                <Select
                  value={newForm.courseId}
                  onValueChange={(v) => setNewForm({ ...newForm, courseId: v })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Choose a course..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-56">
                    {coursesQuery.data?.map((c: any) => (
                      <SelectItem key={c.courseId} value={String(c.courseId)} className="text-xs">
                        {c.title} {Number(c.price ?? 0) === 0 ? "(Free)" : `($${c.price})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Initial Status</Label>
                <Select
                  value={newForm.status}
                  onValueChange={(v) => setNewForm({ ...newForm, status: v })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENROLL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setCreating(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => create.mutate()}
                disabled={create.isPending || !newForm.userId || !newForm.courseId}
              >
                {create.isPending ? "Enrolling..." : "Enroll Student"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: "ALL", label: "All Enrollments", count: allEnrollments.length },
            { key: "ACTIVE", label: "Active", count: activeCount },
            { key: "COMPLETED", label: "Completed", count: completedCount },
            { key: "CANCELLED", label: "Cancelled", count: cancelledCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                statusFilter === tab.key
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] opacity-80">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by student or course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <ApiAlert error={list.error} />

      {list.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card shadow-xs overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enrollment #</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Enrolled Course</TableHead>
                <TableHead className="w-36">Status</TableHead>
                <TableHead>Date Enrolled</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEnrollments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                    No enrollments found matching the criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredEnrollments.map((e: any) => (
                  <TableRow key={e.enrollmentId}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{e.enrollmentId}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="font-medium text-foreground">{e.username || "Student"}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {e.userEmail || `User #${e.userId}`}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs font-medium max-w-[220px] truncate">
                      {e.courseTitle || `Course #${e.courseId}`}
                    </TableCell>

                    <TableCell>
                      <Select
                        value={e.status}
                        onValueChange={(v) => update.mutate({ id: e.enrollmentId, status: v })}
                        disabled={update.isPending}
                      >
                        <SelectTrigger className="w-32 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ENROLL_STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : "—"}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          if (confirm("Delete this enrollment record?")) del.mutate(e.enrollmentId);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function SectionPanel() {
  const qc = useQueryClient();
  const list = useQuery<any[]>({ queryKey: ["admin-sections"], queryFn: () => api("/api/sections") });
  const { data: courses } = useQuery<any[]>({ queryKey: ["admin-courses"], queryFn: () => api("/api/courses") });
  const del = useMutation({ mutationFn: (sectionId: number) => api(`/api/sections/${sectionId}`, { method: "DELETE" }), onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-sections"] }); } });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Sections</h2><SectionDialog mode="create" courses={courses || []} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-sections"] })} /></div>
      <ApiAlert error={list.error} />
      {list.isLoading ? <Skeleton className="h-40" /> : (
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Title</TableHead><TableHead>Duration</TableHead><TableHead>Course</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {list.data?.map((s: any) => (
                <TableRow key={s.sectionId || s.id}>
                  <TableCell>{s.sectionId}</TableCell><TableCell>{s.title}</TableCell><TableCell>{s.duration}</TableCell><TableCell>{s.courseName || courses?.find((c) => c.courseId === s.courseId)?.title || s.courseId}</TableCell>
                  <TableCell className="space-x-1 text-right">
                    <SectionDialog mode="edit" initial={s} courses={courses || []} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-sections"] })} />
                    <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete?")) del.mutate(s.sectionId); }}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function SectionDialog({ mode, initial, courses, onSaved }: { mode: "create" | "edit"; initial?: any; courses: any[]; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(() => initial || { title: "", duration: "", courseId: "" });
  const [error, setError] = useState<unknown>(null);

  // console.log(courses.map(c => c.courseId))
  const save = useMutation({
    mutationFn: () => {
      const body = { ...form, courseId: Number(form.courseId) };
      if (mode === "create") return api("/api/sections", { method: "POST", body });
      return api(`/api/sections/${initial.sectionId}`, { method: "PUT", body });
    },
    onSuccess: () => { toast.success("Saved"); setOpen(false); onSaved(); },
    onError: (e) => setError(e),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) { setForm(initial || { title: "", duration: "", courseId: "" }); setError(null); } }}>
      <DialogTrigger asChild>{mode === "create" ? <Button size="sm"><Plus className="mr-1 h-4 w-4" />New section</Button> : <Button size="icon" variant="ghost"><Layers className="h-4 w-4" /></Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{mode === "create" ? "New section" : "Edit section"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <ApiAlert error={error} />
          <div className="space-y-1"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-1"><Label>Duration</Label><Input value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 1 hour" /></div>
          <div className="space-y-1"><Label>Course</Label>
            <Select value={String(form.courseId)} onValueChange={(v) => setForm({ ...form, courseId: parseInt(v) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{courses.map((c) => <SelectItem key={c.courseId} value={String(c.courseId)}>{c.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter><Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function QuizPanel() {
  const qc = useQueryClient();
  const list = useQuery<any[]>({ queryKey: ["admin-quizzes"], queryFn: () => api("/api/quizzes") });
  const { data: lessons } = useQuery<any[]>({ queryKey: ["admin-lessons"], queryFn: () => api("/api/lessons") });
  const del = useMutation({ mutationFn: (quizId: number) => api(`/api/quizzes/${quizId}`, { method: "DELETE" }), onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-quizzes"] }); } });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Quizzes</h2><QuizDialog mode="create" lessons={lessons || []} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-quizzes"] })} /></div>
      <ApiAlert error={list.error} />
      {list.isLoading ? <Skeleton className="h-40" /> : (
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Title</TableHead><TableHead>Points</TableHead><TableHead>Lesson</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {list.data?.map((q: any) => (
                <TableRow key={q.quizId}>
                  <TableCell>{q.quizId}</TableCell><TableCell>{q.title}</TableCell><TableCell>{q.totalPoints}</TableCell><TableCell>{q.lessonName || lessons?.find((l) => l.lessonId === q.lessonId)?.title || q.lessonId}</TableCell>
                  <TableCell className="space-x-1 text-right">
                    <QuizDialog mode="edit" initial={q} lessons={lessons || []} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-quizzes"] })} />
                    <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete?")) del.mutate(q.quizId); }}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function QuizDialog({ mode, initial, lessons, onSaved }: { mode: "create" | "edit"; initial?: any; lessons: any[]; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(() => initial || { title: "", totalPoints: 10, lessonId: "" });
  const [error, setError] = useState<unknown>(null);

  const save = useMutation({
    mutationFn: () => {
      const body = { ...form, lessonId: Number(form.lessonId) };
      if (mode === "create") return api("/api/quizzes", { method: "POST", body });
      return api(`/api/quizzes/${initial.quizId}`, { method: "PUT", body });
    },
    onSuccess: () => { toast.success("Saved"); setOpen(false); onSaved(); },
    onError: (e) => setError(e),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) { setForm(initial || { title: "", totalPoints: 10, lessonId: "" }); setError(null); } }}>
      <DialogTrigger asChild>{mode === "create" ? <Button size="sm"><Plus className="mr-1 h-4 w-4" />New quiz</Button> : <Button size="icon" variant="ghost"><ListChecks className="h-4 w-4" /></Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{mode === "create" ? "New quiz" : "Edit quiz"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <ApiAlert error={error} />
          <div className="space-y-1"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-1"><Label>Total Points</Label><Input type="number" value={form.totalPoints} onChange={(e) => setForm({ ...form, totalPoints: Number(e.target.value) })} /></div>
          <div className="space-y-1"><Label>Lesson</Label>
            <Select value={String(form.lessonId)} onValueChange={(v) => setForm({ ...form, lessonId: parseInt(v) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{lessons.map((l) => <SelectItem key={l.lessonId} value={String(l.lessonId)}>{l.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter><Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function QuestionPanel() {
  const qc = useQueryClient();
  const list = useQuery<any[]>({ queryKey: ["admin-questions"], queryFn: () => api("/api/questions") });
  const { data: quizzes } = useQuery<any[]>({ queryKey: ["admin-quizzes"], queryFn: () => api("/api/quizzes") });
  const del = useMutation({ mutationFn: (id: number) => api(`/api/questions/${id}`, { method: "DELETE" }), onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-questions"] }); } });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Questions</h2><QuestionDialog mode="create" quizzes={quizzes || []} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-questions"] })} /></div>
      <ApiAlert error={list.error} />
      {list.isLoading ? <Skeleton className="h-40" /> : (
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Question</TableHead><TableHead>Points</TableHead><TableHead>Quiz</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {list.data?.map((q: any) => (
                <TableRow key={q.questionId}>
                  <TableCell>{q.questionId}</TableCell>
                  <TableCell className="max-w-xs truncate">{q.questionText}</TableCell>
                  <TableCell><Badge variant="outline">{q.point != null ? `${q.point} pts` : "Auto"}</Badge></TableCell>
                  <TableCell>{quizzes?.find((z) => z.quizId === q.quizId)?.title || q.quizId}</TableCell>
                  <TableCell className="space-x-1 text-right">
                    <QuestionDialog mode="edit" initial={q} quizzes={quizzes || []} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-questions"] })} />
                    <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete?")) del.mutate(q.questionId); }}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function QuestionDialog({ mode, initial, quizzes, onSaved }: { mode: "create" | "edit"; initial?: any; quizzes: any[]; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(() => initial || { questionText: "", point: "", quizId: "" });
  const [error, setError] = useState<unknown>(null);

  const save = useMutation({
    mutationFn: () => {
      const body = {
        ...form,
        quizId: Number(form.quizId),
        point: form.point === "" || form.point == null ? null : Number(form.point),
      };
      if (mode === "create") return api("/api/questions", { method: "POST", body });
      return api(`/api/questions/${initial.questionId}`, { method: "PUT", body });
    },
    onSuccess: () => { toast.success("Saved"); setOpen(false); onSaved(); },
    onError: (e) => setError(e),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) { setForm(initial || { questionText: "", point: "", quizId: "" }); setError(null); } }}>
      <DialogTrigger asChild>{mode === "create" ? <Button size="sm"><Plus className="mr-1 h-4 w-4" />New question</Button> : <Button size="icon" variant="ghost"><HelpCircle className="h-4 w-4" /></Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{mode === "create" ? "New question" : "Edit question"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <ApiAlert error={error} />
          <div className="space-y-1"><Label>Question</Label><Textarea value={form.questionText} onChange={(e) => setForm({ ...form, questionText: e.target.value })} /></div>
          <div className="space-y-1">
            <Label>Point Value</Label>
            <Input
              type="number"
              placeholder="e.g. 1"
              value={form.point ?? ""}
              onChange={(e) => setForm({ ...form, point: e.target.value })}
            />
          </div>
          <div className="space-y-1"><Label>Quiz</Label>
            <Select value={String(form.quizId)} onValueChange={(v) => setForm({ ...form, quizId: parseInt(v) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{quizzes.map((z) => <SelectItem key={z.quizId} value={String(z.quizId)}>{z.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter><Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AnswerPanel() {
  const qc = useQueryClient();
  const list = useQuery<any[]>({ queryKey: ["admin-answers"], queryFn: () => api("/api/answers") });
  const { data: questions } = useQuery<any[]>({ queryKey: ["admin-questions"], queryFn: () => api("/api/questions") });
  const del = useMutation({ mutationFn: (id: number) => api(`/api/answers/${id}`, { method: "DELETE" }), onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-answers"] }); } });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Answers</h2><AnswerDialog mode="create" questions={questions || []} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-answers"] })} /></div>
      <ApiAlert error={list.error} />
      {list.isLoading ? <Skeleton className="h-40" /> : (
        <div className="rounded-md border border-border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>ID</TableHead><TableHead>Answer</TableHead><TableHead>Correct</TableHead><TableHead>Question</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {list.data?.map((a: any) => (
                <TableRow key={a.answerId}>
                  <TableCell>{a.answerId}</TableCell><TableCell className="max-w-xs truncate">{a.answerText}</TableCell><TableCell>{a.isCorrect ? <Badge>Yes</Badge> : <Badge variant="secondary">No</Badge>}</TableCell><TableCell>{questions?.find((q) => q.questionId === a.questionId)?.questionText?.substring(0, 30) || a.questionId}</TableCell>
                  <TableCell className="space-x-1 text-right">
                    <AnswerDialog mode="edit" initial={a} questions={questions || []} onSaved={() => qc.invalidateQueries({ queryKey: ["admin-answers"] })} />
                    <Button size="icon" variant="ghost" onClick={() => { if (confirm("Delete?")) del.mutate(a.answerId); }}><Trash2 className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function AnswerDialog({ mode, initial, questions, onSaved }: { mode: "create" | "edit"; initial?: any; questions: any[]; onSaved: () => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(() => initial || { answerText: "", isCorrect: false, questionId: "" });
  const [error, setError] = useState<unknown>(null);

  const save = useMutation({
    mutationFn: () => {
      const body = { ...form, questionId: Number(form.questionId) };
      if (mode === "create") return api("/api/answers", { method: "POST", body });
      return api(`/api/answers/${initial.answerId}`, { method: "PUT", body });
    },
    onSuccess: () => { toast.success("Saved"); setOpen(false); onSaved(); },
    onError: (e) => setError(e),
  });

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) { setForm(initial || { answerText: "", isCorrect: false, questionId: "" }); setError(null); } }}>
      <DialogTrigger asChild>{mode === "create" ? <Button size="sm"><Plus className="mr-1 h-4 w-4" />New answer</Button> : <Button size="icon" variant="ghost"><CheckSquare className="h-4 w-4" /></Button>}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{mode === "create" ? "New answer" : "Edit answer"}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <ApiAlert error={error} />
          <div className="space-y-1"><Label>Answer</Label><Textarea value={form.answerText} onChange={(e) => setForm({ ...form, answerText: e.target.value })} /></div>
          <div className="space-y-1"><Label>Question</Label>
            <Select value={String(form.questionId)} onValueChange={(v) => setForm({ ...form, questionId: parseInt(v) })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{questions.map((q) => <SelectItem key={q.questionId} value={String(q.questionId)}>{q.questionText?.substring(0, 50)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.isCorrect} onChange={(e) => setForm({ ...form, isCorrect: e.target.checked })} id="correct" />
            <Label htmlFor="correct">Mark as correct answer</Label>
          </div>
        </div>
        <DialogFooter><Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateAdmin() {
  const [form, setForm] = useState({ email: "", username: "", password: "", role: "ADMIN" });
  const [error, setError] = useState<unknown>(null);
  const m = useMutation({
    mutationFn: () => api("/admin/register", { method: "POST", body: form }),
    onSuccess: () => { toast.success("Admin created"); setForm({ email: "", username: "", password: "", role: "ADMIN" }); },
    onError: (e) => setError(e),
  });
  return (
    <div className="max-w-md space-y-4">
      <h2 className="text-lg font-semibold">Create admin user</h2>
      <p className="text-sm text-muted-foreground">The backend doesn't expose a full users list; this creates a new admin account.</p>
      <ApiAlert error={error} />
      <Card><CardContent className="space-y-3 pt-6">
        <div className="space-y-1"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
        <div className="space-y-1"><Label>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
        <div className="space-y-1"><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
        <Button onClick={() => m.mutate()} disabled={m.isPending}>{m.isPending ? "Creating..." : "Create admin"}</Button>
      </CardContent></Card>
    </div>
  );
}
function AdminUsers() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [open, setOpen] = useState(false);

  const emptyForm = {
    fullName: "",
    phoneNumber: "",
    email: "",
    username: "",
    password: "",
    role: "STUDENT",
  };

  const [form, setForm] = useState(emptyForm);

  const USER_ROLES = ["STUDENT", "INSTRUCTOR", "ADMIN"];

  const list = useQuery<any[]>({
    queryKey: ["admin-users"],
    queryFn: () => api("/api/users"),
  });

  const create = useMutation({
    mutationFn: () =>
      api("/admin/register", {
        method: "POST",
        body: form,
      }),
    onSuccess: () => {
      toast.success("New user provisioned successfully");
      setOpen(false);
      setForm(emptyForm);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: any) => {
      toast.error(e.message || "Failed to create user");
    },
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: number; role: string }) =>
      api(`/api/users/${id}/role`, {
        method: "PATCH",
        body: { role },
      }),
    onSuccess: (_, vars) => {
      toast.success(`User role updated to ${vars.role}`);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: any) => {
      toast.error(e.message || "Failed to update role");
    },
  });

  const del = useMutation({
    mutationFn: (id: number) =>
      api(`/api/users/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("User removed");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
    },
    onError: (e: any) => {
      toast.error(e.message || "Failed to delete user");
    },
  });

  const allUsers = list.data || [];
  const studentCount = allUsers.filter((u) => u.role === "STUDENT" || u.role === "USER").length;
  const instructorCount = allUsers.filter((u) => u.role === "INSTRUCTOR").length;
  const adminCount = allUsers.filter((u) => u.role === "ADMIN").length;

  const filteredUsers = allUsers.filter((u) => {
    const matchesRole =
      roleFilter === "ALL"
        ? true
        : roleFilter === "STUDENT"
        ? u.role === "STUDENT" || u.role === "USER"
        : u.role === roleFilter;

    if (!matchesRole) return false;

    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return (
      (u.fullName && u.fullName.toLowerCase().includes(query)) ||
      (u.username && u.username.toLowerCase().includes(query)) ||
      (u.email && u.email.toLowerCase().includes(query)) ||
      (u.phoneNumber && u.phoneNumber.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-foreground">User Management & Roles</h2>
          <p className="text-xs text-muted-foreground">
            Manage system permissions, provision instructor & student accounts, and oversee user profiles.
          </p>
        </div>
        <Button size="sm" className="h-8 gap-1.5 text-xs font-medium" onClick={() => setOpen(true)}>
          <UserPlus className="h-3.5 w-3.5" />
          Provision User
        </Button>
      </div>

      {/* Role filter pills & Search bar */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: "ALL", label: "All Users", count: allUsers.length },
            { key: "STUDENT", label: "Students", count: studentCount },
            { key: "INSTRUCTOR", label: "Instructors", count: instructorCount },
            { key: "ADMIN", label: "Admins", count: adminCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setRoleFilter(tab.key)}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                roleFilter === tab.key
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] opacity-80">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>

      <ApiAlert error={list.error} />

      {list.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
          <Skeleton className="h-10" />
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card shadow-xs overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead className="w-40">System Role</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                    No users matching the filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u: any) => {
                  const initial = (u.fullName || u.username || u.email || "U").charAt(0).toUpperCase();
                  return (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-7 w-7 border border-border shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                              {initial}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium text-xs text-foreground truncate">
                              {u.fullName || u.username}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate">@{u.username}</span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span className="text-foreground">{u.email}</span>
                          {u.phoneNumber && (
                            <span className="text-[11px] text-muted-foreground">{u.phoneNumber}</span>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-medium ${
                            u.isVerified || u.verified
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
                          }`}
                        >
                          {u.isVerified || u.verified ? "Verified" : "Unverified"}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Select
                          value={u.role === "USER" ? "STUDENT" : u.role}
                          onValueChange={(v) => updateRole.mutate({ id: u.id, role: v })}
                          disabled={updateRole.isPending}
                        >
                          <SelectTrigger className="h-7 text-xs w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {USER_ROLES.map((role) => (
                              <SelectItem key={role} value={role} className="text-xs">
                                {role}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                      </TableCell>

                      <TableCell className="text-right">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete user "${u.username}" (#${u.id})?`)) {
                              del.mutate(u.id);
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Provision User Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Provision Platform User</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="regFullName" className="text-xs">
                Full Name
              </Label>
              <Input
                id="regFullName"
                className="h-8 text-xs"
                placeholder="e.g. Sok San"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="regUsername" className="text-xs">
                  Username
                </Label>
                <Input
                  id="regUsername"
                  className="h-8 text-xs"
                  placeholder="soksan"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="regPhone" className="text-xs">
                  Phone Number
                </Label>
                <Input
                  id="regPhone"
                  className="h-8 text-xs"
                  placeholder="+855 12 345 678"
                  value={form.phoneNumber}
                  onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="regEmail" className="text-xs">
                Email Address
              </Label>
              <Input
                id="regEmail"
                type="email"
                className="h-8 text-xs"
                placeholder="soksan@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="regPassword" className="text-xs">
                Temporary Password
              </Label>
              <Input
                id="regPassword"
                type="password"
                className="h-8 text-xs"
                placeholder="Minimum 6 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Initial Permission Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="STUDENT" className="text-xs">
                    Student (Learner)
                  </SelectItem>
                  <SelectItem value="INSTRUCTOR" className="text-xs">
                    Instructor (Course Creator)
                  </SelectItem>
                  <SelectItem value="ADMIN" className="text-xs">
                    Admin (Full Console Access)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => create.mutate()}
              disabled={create.isPending || !form.username || !form.email || !form.password}
            >
              {create.isPending ? "Provisioning..." : "Provision User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AdminAssignments() {
  const qc = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [submissionsAssignment, setSubmissionsAssignment] = useState<any>(null);
  const [gradingSubmission, setGradingSubmission] = useState<any>(null);
  const [score, setScore] = useState<string>("");
  const [grade, setGrade] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [gradingPending, setGradingPending] = useState(false);

  const coursesQuery = useQuery<any[]>({
    queryKey: ["admin-courses"],
    queryFn: () => api("/api/courses", { auth: false }),
  });

  const activeCourseId = selectedCourseId || (coursesQuery.data && coursesQuery.data.length > 0 ? String(coursesQuery.data[0].courseId) : "");

  const assignmentsQuery = useQuery<any[]>({
    queryKey: ["admin-course-assignments", activeCourseId],
    queryFn: () => api(`/api/courses/${activeCourseId}/assignments`),
    enabled: Boolean(activeCourseId),
  });

  const submissionsQuery = useQuery<any[]>({
    queryKey: ["admin-assignment-submissions", submissionsAssignment?.assignmentId],
    queryFn: () => api(`/api/assignments/${submissionsAssignment.assignmentId}/submissions`),
    enabled: Boolean(submissionsAssignment),
  });

  const deleteAssignment = useMutation({
    mutationFn: (id: number) => api(`/api/assignments/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Assignment deleted successfully");
      qc.invalidateQueries({ queryKey: ["admin-course-assignments", activeCourseId] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to delete assignment"),
  });

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;
    setGradingPending(true);
    try {
      await api(`/api/assignments/submissions/${gradingSubmission.submissionId}/grade`, {
        method: "PUT",
        body: {
          score: score !== "" ? Number(score) : null,
          grade: grade.trim() || null,
          feedback: feedback.trim() || null,
        },
      });
      toast.success("Submission graded successfully");
      setGradingSubmission(null);
      qc.invalidateQueries({ queryKey: ["admin-assignment-submissions", submissionsAssignment?.assignmentId] });
    } catch (err: any) {
      toast.error(err.message || "Failed to grade submission");
    } finally {
      setGradingPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Course Assignments Management</h2>
        <div className="flex items-center gap-2">
          <Label className="text-xs whitespace-nowrap">Filter Course:</Label>
          <Select value={activeCourseId} onValueChange={(val) => setSelectedCourseId(val)}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select course..." />
            </SelectTrigger>
            <SelectContent>
              {coursesQuery.data?.map((c) => (
                <SelectItem key={c.courseId} value={String(c.courseId)}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {assignmentsQuery.isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !assignmentsQuery.data || assignmentsQuery.data.length === 0 ? (
        <div className="rounded-md border p-8 text-center text-muted-foreground bg-card">
          No assignments found for this course.
        </div>
      ) : (
        <div className="rounded-md border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Max Score</TableHead>
                <TableHead>Resubmission</TableHead>
                <TableHead>Attachment</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignmentsQuery.data.map((a: any) => (
                <TableRow key={a.assignmentId}>
                  <TableCell>{a.assignmentId}</TableCell>
                  <TableCell className="font-semibold">{a.title}</TableCell>
                  <TableCell className="text-muted-foreground">{a.sectionTitle || "—"}</TableCell>
                  <TableCell className="text-xs">
                    {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell>{a.maxScore} pts</TableCell>
                  <TableCell>
                    <Badge variant={a.allowResubmission ? "secondary" : "outline"} className="text-[10px]">
                      {a.allowResubmission ? "Allowed" : "One-time"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {a.supportingFileUrl ? (
                      <a
                        href={mediaUrl(a.supportingFileUrl)}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="text-xs text-primary underline"
                      >
                        Download
                      </a>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1"
                      onClick={() => setSubmissionsAssignment(a)}
                    >
                      <Users className="h-3.5 w-3.5" /> Submissions
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-destructive hover:bg-destructive/10"
                      onClick={() => {
                        if (window.confirm("Delete this assignment?")) {
                          deleteAssignment.mutate(a.assignmentId);
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Submissions Dialog */}
      {submissionsAssignment && (
        <Dialog open onOpenChange={() => setSubmissionsAssignment(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Submissions for: {submissionsAssignment.title}</DialogTitle>
              <p className="text-xs text-muted-foreground">
                Course: {submissionsAssignment.courseTitle} • Max Score: {submissionsAssignment.maxScore} pts
              </p>
            </DialogHeader>

            <div className="py-2">
              {submissionsQuery.isLoading ? (
                <Skeleton className="h-40 w-full" />
              ) : !submissionsQuery.data || submissionsQuery.data.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground border rounded-lg">
                  No students have submitted this assignment yet.
                </p>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Submitted At</TableHead>
                        <TableHead>Submission</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Score & Grade</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissionsQuery.data.map((s: any) => (
                        <TableRow key={s.submissionId}>
                          <TableCell>
                            <p className="font-semibold text-sm">{s.studentName || "Student"}</p>
                            <p className="text-xs text-muted-foreground">{s.studentEmail}</p>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            {s.textSubmission && (
                              <p className="text-xs line-clamp-2 font-mono bg-muted/40 p-1 rounded">
                                {s.textSubmission}
                              </p>
                            )}
                            {s.fileUrl && (
                              <a
                                href={mediaUrl(s.fileUrl)}
                                target="_blank"
                                rel="noreferrer"
                                download
                                className="text-xs text-primary underline block mt-1"
                              >
                                Download Attached File
                              </a>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                s.status === "GRADED"
                                  ? "default"
                                  : s.status === "LATE"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {s.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {s.score != null ? (
                              <div>
                                <span className="font-bold text-sm">
                                  {s.score} / {submissionsAssignment.maxScore}
                                </span>
                                {s.grade && (
                                  <Badge className="ml-1.5 text-[10px] bg-emerald-600">{s.grade}</Badge>
                                )}
                                {s.feedback && (
                                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                    "{s.feedback}"
                                  </p>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">Not graded</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              onClick={() => {
                                setGradingSubmission(s);
                                setScore(s.score != null ? String(s.score) : "");
                                setGrade(s.grade || "");
                                setFeedback(s.feedback || "");
                              }}
                            >
                              {s.status === "GRADED" ? "Update Grade" : "Grade"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSubmissionsAssignment(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Grade Dialog */}
      {gradingSubmission && (
        <Dialog open onOpenChange={() => setGradingSubmission(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Grade Student Submission</DialogTitle>
              <p className="text-xs text-muted-foreground">
                Student: {gradingSubmission.studentName} ({gradingSubmission.studentEmail})
              </p>
            </DialogHeader>
            <form onSubmit={handleGradeSubmit} className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Score (Max: {submissionsAssignment?.maxScore})</Label>
                  <Input
                    type="number"
                    step="any"
                    min={0}
                    max={submissionsAssignment?.maxScore}
                    required
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Grade (Optional)</Label>
                  <Input
                    placeholder="A, B, C, D, F"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value.toUpperCase())}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label>Feedback</Label>
                <Textarea
                  placeholder="Feedback for the student..."
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="mt-1"
                />
              </div>
              <DialogFooter className="gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setGradingSubmission(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={gradingPending}>
                  {gradingPending ? "Saving..." : "Save Grade"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

