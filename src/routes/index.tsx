import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { api, mediaUrl } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ApiAlert } from "@/components/ApiAlert";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Clock,
  User,
  ArrowRight,
  BookOpen,
  Star,
  Heart,
  Sparkles,
  TrendingUp,
  Filter,
  Play,
  LayoutGrid,
  List,
  RotateCcw,
  X,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Course Catalog — Lumen LMS" },
      { name: "description", content: "Explore expert-led courses, certifications, and interactive lessons." },
    ],
  }),
  component: Index,
});

type Course = {
  courseId: number;
  title: string;
  description?: string;
  price?: number;
  overallDuration?: string;
  accessDurationDays?: number;
  coverDir?: string;
  coverUrl?: string;
  coverPublicId?: string;
  instructorName?: string;
  instructor?: any;
  categories?: Array<{ id: number; category: string }> | string[];
  rating?: number;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL_LEVELS";
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  lessonCount?: number;
  enrollmentCount?: number;
  isFavorite?: boolean;
};

function Index() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { isAuthenticated } = useAuth();

  const [q, setQ] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [minRatingFilter, setMinRatingFilter] = useState<number>(0);
  const [sortOption, setSortOption] = useState<string>("latest");
  const [activeFeed, setActiveFeed] = useState<"all" | "featured" | "popular" | "favorites">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [visibleCount, setVisibleCount] = useState(6);

  const continueQuery = useQuery<any>({
    queryKey: ["continue-learning"],
    queryFn: () => api("/api/learning/continue", { auth: true }).catch(() => null),
    enabled: isAuthenticated,
  });

  const enrollmentsQuery = useQuery<any[]>({
    queryKey: ["my-enrollments"],
    queryFn: () => api("/api/enrollments/me", { auth: true }).catch(() => []),
    enabled: isAuthenticated,
  });

  const enrollmentMap = useMemo(() => {
    const map = new Map<number, any>();
    for (const e of enrollmentsQuery.data || []) {
      const cid = Number(e.course?.courseId ?? e.courseId);
      if (cid) map.set(cid, e);
    }
    return map;
  }, [enrollmentsQuery.data]);

  // Main Courses Query
  const { data, isLoading, error } = useQuery<Course[]>({
    queryKey: ["courses", q, activeCategory, levelFilter, minRatingFilter, sortOption, activeFeed, isAuthenticated],
    queryFn: () => {
      if (activeFeed === "featured") {
        return api<Course[]>("/api/courses/featured", { auth: isAuthenticated });
      }
      if (activeFeed === "popular") {
        return api<Course[]>("/api/courses/popular", { auth: isAuthenticated });
      }
      if (activeFeed === "favorites") {
        return api<Course[]>("/api/favorites", { auth: true });
      }
      return api<Course[]>("/api/courses", {
        auth: isAuthenticated,
        query: {
          query: q.trim() || undefined,
          level: levelFilter !== "ALL" ? levelFilter : undefined,
          minRating: minRatingFilter > 0 ? minRatingFilter : undefined,
          sort: sortOption,
        },
      });
    },
  });

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ courseId, isFav }: { courseId: number; isFav: boolean }) => {
      if (isFav) {
        await api(`/api/favorites/${courseId}`, { method: "DELETE", auth: true });
      } else {
        await api(`/api/favorites/${courseId}`, { method: "POST", auth: true });
      }
    },
    onSuccess: (_, { isFav }) => {
      toast.success(isFav ? "Removed from saved courses" : "Saved to your courses!");
      qc.invalidateQueries({ queryKey: ["courses"] });
      qc.invalidateQueries({ queryKey: ["my-favorites"] });
    },
    onError: (e: any) => toast.error(e.message || "Failed to update wishlist"),
  });

  const handleToggleFavorite = (courseId: number, currentFav: boolean) => {
    if (!isAuthenticated) {
      toast.info("Please sign in to save courses to your wishlist");
      nav({ to: "/login" });
      return;
    }
    toggleFavoriteMutation.mutate({ courseId, isFav: currentFav });
  };

  const resetFilters = () => {
    setQ("");
    setActiveCategory("All");
    setLevelFilter("ALL");
    setMinRatingFilter(0);
    setSortOption("latest");
    setVisibleCount(6);
  };

  const hasActiveFilters = q.trim() !== "" || activeCategory !== "All" || levelFilter !== "ALL" || minRatingFilter > 0 || sortOption !== "latest";

  const allCategories = useMemo(() => {
    if (!data) return ["All"];
    const cats = new Set<string>();
    data.forEach((c) =>
      (c.categories || []).forEach((x: any) =>
        cats.add(typeof x === "string" ? x : x?.category)
      )
    );
    return ["All", ...Array.from(cats).filter(Boolean).sort()];
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((c) => {
      if (activeCategory === "All") return true;
      return (c.categories || []).some((x: any) =>
        (typeof x === "string" ? x : x?.category) === activeCategory
      );
    });
  }, [data, activeCategory]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <SiteHeader />

      {/* Continue Learning Strip (if authenticated and has progress) */}
      {isAuthenticated && continueQuery.data?.courseId && (
        <aside aria-label="Continue learning resume bar" className="border-b border-border bg-card/60 px-4 py-2.5 backdrop-blur-sm">
          <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex h-6 items-center gap-1 rounded bg-primary/10 px-2 font-semibold text-primary text-[11px] uppercase tracking-wide shrink-0">
                <Play className="h-3 w-3 fill-primary" /> Resume
              </span>
              <span className="font-semibold text-foreground truncate max-w-xs sm:max-w-md">
                {continueQuery.data.courseTitle}
              </span>
              {continueQuery.data.nextLessonTitle && (
                <span className="hidden text-muted-foreground md:inline truncate max-w-xs">
                  Next: {continueQuery.data.nextLessonTitle}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-2">
                <Progress value={continueQuery.data.progressPercentage ?? 0} className="w-24 h-1.5" />
                <span className="text-[11px] font-medium text-muted-foreground">{continueQuery.data.progressPercentage ?? 0}%</span>
              </div>
              <Button
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => nav({ to: "/courses/$id", params: { id: String(continueQuery.data.courseId) } })}
              >
                Continue <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Container */}
      <main className="container mx-auto px-4 py-8 flex-1 space-y-6 sm:px-6">
        {/* Catalog Header */}
        <section className="flex flex-col gap-2 border-b border-border pb-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <h1 className="text-2xl sm:text-3xl font-bold tracking-normal text-foreground">
              Course Catalog
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Explore expert-curated courses, step-by-step interactive lessons, and accredited completion certificates.
          </p>
        </section>

        {/* Discovery Command Bar: Feed tabs + Search */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Feed Switcher Tabs */}
          <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
            <button
              onClick={() => { setActiveFeed("all"); setVisibleCount(6); }}
              className={`inline-flex items-center gap-1.5 justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-all ${
                activeFeed === "all" ? "bg-background text-foreground shadow-sm font-semibold" : "hover:text-foreground"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" /> All Courses
            </button>
            <button
              onClick={() => { setActiveFeed("featured"); setVisibleCount(6); }}
              className={`inline-flex items-center gap-1.5 justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-all ${
                activeFeed === "featured" ? "bg-background text-foreground shadow-sm font-semibold" : "hover:text-foreground"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Featured
            </button>
            <button
              onClick={() => { setActiveFeed("popular"); setVisibleCount(6); }}
              className={`inline-flex items-center gap-1.5 justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-all ${
                activeFeed === "popular" ? "bg-background text-foreground shadow-sm font-semibold" : "hover:text-foreground"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5 text-blue-500" /> Popular
            </button>
            {isAuthenticated && (
              <button
                onClick={() => { setActiveFeed("favorites"); setVisibleCount(6); }}
                className={`inline-flex items-center gap-1.5 justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-medium transition-all ${
                  activeFeed === "favorites" ? "bg-background text-foreground shadow-sm font-semibold" : "hover:text-foreground"
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${activeFeed === "favorites" ? "fill-rose-500 text-rose-500" : "text-rose-500"}`} /> Wishlist
              </button>
            )}
          </div>

          {/* Search bar */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search courses, instructors..."
              className="pl-9 pr-8 h-9 text-xs"
              value={q}
              onChange={(e) => { setQ(e.target.value); setVisibleCount(6); }}
            />
            {q && (
              <button
                type="button"
                onClick={() => { setQ(""); setVisibleCount(6); }}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </section>

        {/* Multi-Criteria Filters Toolbar */}
        {activeFeed === "all" && (
          <section className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground shrink-0">
              <Filter className="h-3.5 w-3.5" />
              <span>Filters:</span>
            </div>

            {/* Level select */}
            <div className="w-36">
              <Select
                value={levelFilter}
                onValueChange={(val) => { setLevelFilter(val); setVisibleCount(6); }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Levels</SelectItem>
                  <SelectItem value="BEGINNER">Beginner</SelectItem>
                  <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                  <SelectItem value="ADVANCED">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Rating select */}
            <div className="w-32">
              <Select
                value={String(minRatingFilter)}
                onValueChange={(val) => { setMinRatingFilter(Number(val)); setVisibleCount(6); }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Any Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Any Rating</SelectItem>
                  <SelectItem value="4">4.0+ Stars</SelectItem>
                  <SelectItem value="3">3.0+ Stars</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort select */}
            <div className="w-40">
              <Select
                value={sortOption}
                onValueChange={(val) => { setSortOption(val); setVisibleCount(6); }}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Latest Released</SelectItem>
                  <SelectItem value="popular">Most Enrolled</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode Toggle (Grid vs Table) */}
            <div className="ml-auto flex items-center gap-1">
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
                  onClick={resetFilters}
                >
                  <RotateCcw className="h-3 w-3" /> Reset
                </Button>
              )}

              <div className="flex items-center rounded-md border border-border p-0.5 bg-muted/40">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "grid" ? "secondary" : "ghost"}
                      size="icon"
                      className="h-7 w-7 rounded-sm"
                      onClick={() => setViewMode("grid")}
                      aria-label="Grid view"
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Grid view</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === "table" ? "secondary" : "ghost"}
                      size="icon"
                      className="h-7 w-7 rounded-sm"
                      onClick={() => setViewMode("table")}
                      aria-label="Table view"
                    >
                      <List className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Table comparison view</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </section>
        )}

        {/* Category Filter Chips */}
        {activeFeed === "all" && allCategories.length > 1 && (
          <nav aria-label="Course categories" className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {allCategories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setVisibleCount(6); }}
                  className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                      : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </nav>
        )}

        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-foreground">
              {activeFeed === "featured"
                ? "Featured Courses"
                : activeFeed === "popular"
                ? "Most Popular Courses"
                : activeFeed === "favorites"
                ? "Saved Wishlist"
                : activeCategory !== "All"
                ? `${activeCategory} Courses`
                : "All Courses"}
            </h2>
            {!isLoading && (
              <Badge variant="secondary" className="text-xs px-2 py-0">
                {filtered.length}
              </Badge>
            )}
          </div>
        </div>

        <ApiAlert error={error} />

        {/* Courses Listing */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-80 rounded-lg border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">No courses found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              We couldn't find any courses matching your criteria. Try adjusting your search keyword or clearing the filters.
            </p>
            {hasActiveFilters && (
              <Button size="sm" variant="outline" className="mt-4 gap-1.5" onClick={resetFilters}>
                <RotateCcw className="h-3.5 w-3.5" /> Clear all filters
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.slice(0, visibleCount).map((c) => (
              <CourseCardItem
                key={c.courseId}
                c={c}
                enrollment={enrollmentMap.get(c.courseId)}
                onOpen={() => nav({ to: "/courses/$id", params: { id: String(c.courseId) } })}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          <CourseTableView
            courses={filtered.slice(0, visibleCount)}
            enrollmentMap={enrollmentMap}
            onOpen={(id) => nav({ to: "/courses/$id", params: { id: String(id) } })}
            onToggleFavorite={handleToggleFavorite}
          />
        )}

        {/* Show More Pagination */}
        {filtered.length > visibleCount && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-6">
            <span className="text-xs text-muted-foreground">
              Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} courses
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => setVisibleCount((n) => n + 6)}
              >
                Show 6 more
              </Button>
              <Button
                size="sm"
                className="text-xs"
                onClick={() => setVisibleCount(filtered.length)}
              >
                Show all {filtered.length}
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Quiet, Utilitarian Site Footer */}
      <footer className="border-t border-border bg-card mt-16 py-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-2 md:col-span-1">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <GraduationCap className="h-4 w-4" />
                </div>
                <span>Lumen LMS</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Expert-led curriculum designed for career acceleration, technical mastery, and recognized credentials.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-foreground">Courses & Learning</div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li><a href="/" className="hover:text-foreground transition-colors">Course Catalog</a></li>
                <li><a href="/instructors" className="hover:text-foreground transition-colors">Instructor Directory</a></li>
                <li><a href="/verify-certificate" className="hover:text-foreground transition-colors">Certificate Verification</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-foreground">Student Portal</div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li><a href="/my/enrollments" className="hover:text-foreground transition-colors">My Enrollments</a></li>
                <li><a href="/my/payments" className="hover:text-foreground transition-colors">Payment History</a></li>
                <li><a href="/profile" className="hover:text-foreground transition-colors">Account Profile</a></li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-foreground">Platform</div>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li><a href="/login" className="hover:text-foreground transition-colors">Sign In</a></li>
                <li><a href="/register" className="hover:text-foreground transition-colors">Create Account</a></li>
                <li><a href="/verify-certificate" className="hover:text-foreground transition-colors">Credential Lookup</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <div>© {new Date().getFullYear()} Lumen LMS. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Operational Status: Healthy
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function CourseCardItem({
  c,
  enrollment,
  onOpen,
  onToggleFavorite,
}: {
  c: Course;
  enrollment?: any;
  onOpen: () => void;
  onToggleFavorite: (courseId: number, currentFav: boolean) => void;
}) {
  const isExpired = Boolean(enrollment && (enrollment.isExpired || enrollment.status === "EXPIRED"));
  const isEnrolled = Boolean(enrollment && !isExpired && (enrollment.status === "ACTIVE" || enrollment.status === "COMPLETED"));
  const discountedPrice = Number(c.price ?? 0) * 0.5;

  const cover = mediaUrl(c.coverUrl || c.coverDir);
  const inst =
    typeof c.instructor === "object"
      ? c.instructor?.fullName || c.instructor?.username || c.instructor?.email
      : c.instructor || c.instructorName;
  const cats = (() => {
    const rawList = c.categories || [];
    return rawList.map((raw: any) => (typeof raw === "string" ? raw : raw?.category)).filter(Boolean);
  })();
  const isFree = !c.price || Number(c.price) === 0;

  const levelColor =
    c.level === "BEGINNER"
      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
      : c.level === "INTERMEDIATE"
      ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20"
      : c.level === "ADVANCED"
      ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20"
      : "bg-muted text-muted-foreground border-border";

  return (
    <Card
      className={`group flex flex-col overflow-hidden border bg-card transition-all hover:shadow-md cursor-pointer ${
        isExpired
          ? "opacity-85 border-destructive/40 bg-muted/20 hover:opacity-100 hover:border-destructive/60"
          : "border-border hover:border-primary/40"
      }`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onOpen()}
    >
      {/* Cover Image */}
      <div className="aspect-[16/9] w-full relative overflow-hidden bg-muted">
        {cover ? (
          <img
            src={cover}
            alt={c.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-accent to-muted p-4 text-center">
            <BookOpen className="h-8 w-8 text-primary/60 mb-1" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {cats[0] || "Lumen LMS"}
            </span>
          </div>
        )}

        {/* Favorite Heart Button with Tooltip */}
        <div className="absolute right-2.5 top-2.5 z-10" onClick={(e) => e.stopPropagation()}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => onToggleFavorite(c.courseId, !!c.isFavorite)}
                aria-label={c.isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-xs border border-border/60 text-foreground transition-all hover:scale-110 hover:bg-background"
              >
                <Heart
                  className={`h-4 w-4 ${c.isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground hover:text-foreground"}`}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent>{c.isFavorite ? "Remove from wishlist" : "Add to wishlist"}</TooltipContent>
          </Tooltip>
        </div>

        {/* Badges Overlay */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1 pointer-events-none">
          <div className="flex items-center gap-1 truncate">
            {cats.slice(0, 1).map((cat: string) => (
              <span
                key={cat}
                className="rounded bg-background/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-semibold text-foreground border border-border/50 truncate"
              >
                {cat}
              </span>
            ))}
          </div>

          {isExpired ? (
            <span className="rounded bg-destructive text-destructive-foreground px-2 py-0.5 text-[10px] font-semibold shrink-0">
              Expired
            </span>
          ) : isEnrolled ? (
            <span className="rounded bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-semibold shrink-0 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Enrolled
            </span>
          ) : c.level ? (
            <span className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${levelColor} shrink-0`}>
              {c.level.replace("_", " ")}
            </span>
          ) : null}
        </div>
      </div>

      {/* Body */}
      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div className="space-y-1.5">
          <h3 className="font-bold text-sm leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {c.title}
          </h3>
          {c.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {c.description}
            </p>
          )}
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {inst && (
              <span className="flex items-center gap-1 truncate max-w-[140px]">
                <User className="h-3.5 w-3.5 shrink-0" /> <span className="truncate">{inst}</span>
              </span>
            )}
            {c.overallDuration && (
              <span className="flex items-center gap-1 shrink-0">
                <Clock className="h-3.5 w-3.5 shrink-0" /> {c.overallDuration}
              </span>
            )}
            {c.rating != null && Number(c.rating) > 0 && (
              <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 shrink-0">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                {Number(c.rating).toFixed(1)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3">
            <div>
              {isExpired ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs line-through text-muted-foreground">
                    ${Number(c.price ?? 0).toFixed(2)}
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    ${discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold px-1 rounded border border-emerald-500/20">
                    -50%
                  </span>
                </div>
              ) : isFree ? (
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Free</span>
              ) : (
                <span className="text-sm font-bold text-foreground">
                  ${Number(c.price).toFixed(2)}
                </span>
              )}
            </div>
            {isExpired ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                <RotateCcw className="h-3 w-3" /> Renew (50% Off)
              </span>
            ) : isEnrolled ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                Continue <ArrowRight className="h-3 w-3" />
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                Enroll <ArrowRight className="h-3 w-3" />
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CourseTableView({
  courses,
  enrollmentMap,
  onOpen,
  onToggleFavorite,
}: {
  courses: Course[];
  enrollmentMap?: Map<number, any>;
  onOpen: (courseId: number) => void;
  onToggleFavorite: (courseId: number, currentFav: boolean) => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Instructor</th>
              <th className="px-4 py-3">Level & Duration</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {courses.map((c) => {
              const cover = mediaUrl(c.coverUrl || c.coverDir);
              const inst =
                typeof c.instructor === "object"
                  ? c.instructor?.fullName || c.instructor?.username || c.instructor?.email
                  : c.instructor || c.instructorName;
              const cats = (() => {
                const rawList = c.categories || [];
                return rawList.map((raw: any) => (typeof raw === "string" ? raw : raw?.category)).filter(Boolean);
              })();
              const isFree = !c.price || Number(c.price) === 0;
              const enrollment = enrollmentMap?.get(c.courseId);
              const isExpired = Boolean(enrollment && (enrollment.isExpired || enrollment.status === "EXPIRED"));
              const isEnrolled = Boolean(enrollment && !isExpired && (enrollment.status === "ACTIVE" || enrollment.status === "COMPLETED"));

              return (
                <tr
                  key={c.courseId}
                  className={`transition-colors cursor-pointer group ${
                    isExpired ? "bg-destructive/5 hover:bg-destructive/10" : "hover:bg-muted/30"
                  }`}
                  onClick={() => onOpen(c.courseId)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-16 rounded overflow-hidden bg-muted shrink-0 border border-border">
                        {cover ? (
                          <img src={cover} alt={c.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
                            <BookOpen className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 max-w-xs sm:max-w-md">
                        <div className="font-semibold text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
                          <span className="truncate">{c.title}</span>
                          {isExpired && (
                            <Badge variant="destructive" className="text-[9px] px-1 py-0 shrink-0">
                              Expired
                            </Badge>
                          )}
                          {isEnrolled && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 shrink-0 text-emerald-600 border-emerald-500/30">
                              Enrolled
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate mt-0.5">
                          {cats[0] && <span>{cats[0]}</span>}
                          {c.lessonCount != null && <span>&bull; {c.lessonCount} lessons</span>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {inst || "Staff Instructor"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <div className="font-medium text-foreground">{c.level ? c.level.replace("_", " ") : "All Levels"}</div>
                      <div className="text-[11px] text-muted-foreground">{c.overallDuration || "Self-paced"}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {c.rating != null && Number(c.rating) > 0 ? (
                      <span className="flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        {Number(c.rating).toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">&mdash;</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {isExpired ? (
                      <div className="flex items-center gap-1.5">
                        <span className="line-through text-muted-foreground">${Number(c.price ?? 0).toFixed(2)}</span>
                        <span className="font-bold text-foreground">${(Number(c.price ?? 0) * 0.5).toFixed(2)}</span>
                      </div>
                    ) : isFree ? (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Free</span>
                    ) : (
                      <span className="font-bold text-foreground">${Number(c.price).toFixed(2)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => onToggleFavorite(c.courseId, !!c.isFavorite)}
                            aria-label={c.isFavorite ? "Remove from wishlist" : "Add to wishlist"}
                          >
                            <Heart className={`h-3.5 w-3.5 ${c.isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{c.isFavorite ? "Remove from wishlist" : "Add to wishlist"}</TooltipContent>
                      </Tooltip>
                      {isExpired ? (
                        <Button
                          size="sm"
                          className="h-7 text-xs px-2.5 bg-[#005a87] hover:bg-[#00476a] text-white gap-1"
                          onClick={() => onOpen(c.courseId)}
                        >
                          <RotateCcw className="h-3 w-3" /> Renew (50% Off)
                        </Button>
                      ) : isEnrolled ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2.5"
                          onClick={() => onOpen(c.courseId)}
                        >
                          Continue
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="h-7 text-xs px-2.5"
                          onClick={() => onOpen(c.courseId)}
                        >
                          Enroll
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

