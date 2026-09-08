import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth, roleHome } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  BookOpen,
  Users,
  ShieldCheck,
  CreditCard,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  CheckCircle2,
} from "lucide-react";
import { NotificationPopover } from "@/components/NotificationPopover";

export function SiteHeader({ hideNav = false }: { hideNav?: boolean } = {}) {
  const { isAuthenticated, role, email, logout } = useAuth();
  const nav = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const initial = (email || "U").charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    nav({ to: "/login" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md transition-colors">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 font-bold tracking-normal text-foreground group">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold leading-tight">Lumen LMS</span>
              <span className="text-[10px] font-medium text-muted-foreground leading-none">Learning Portal</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          {!hideNav && (
            <nav className="hidden items-center gap-1 text-sm md:flex">
              <Link
                to="/"
                className="rounded-md px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                activeProps={{ className: "bg-accent text-foreground font-semibold" }}
              >
                Courses
              </Link>
              <Link
                to="/instructors"
                className="rounded-md px-3 py-1.5 font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                activeProps={{ className: "bg-accent text-foreground font-semibold" }}
              >
                Instructors
              </Link>
            </nav>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <NotificationPopover />

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-2.5 h-9 rounded-full hover:bg-accent">
                    <Avatar className="h-7 w-7 border border-border">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[120px] truncate text-xs font-medium text-foreground hidden lg:inline">
                      {email}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground truncate">{email}</p>
                      <div className="flex items-center gap-1.5 pt-1">
                        <Badge variant="outline" className="text-[10px] font-medium uppercase tracking-wider py-0 px-1.5">
                          {role || "STUDENT"}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => nav({ to: "/profile" })} className="cursor-pointer gap-2">
                    <User className="h-4 w-4 text-muted-foreground" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav({ to: "/my/enrollments" })} className="cursor-pointer gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" /> My Learning
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav({ to: "/my/payments" })} className="cursor-pointer gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" /> Payment History
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => nav({ to: "/verify-certificate" })} className="cursor-pointer gap-2">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" /> Verify Certificate
                  </DropdownMenuItem>
                  {role && role !== "USER" && role !== "STUDENT" && (
                    <DropdownMenuItem onClick={() => nav({ to: roleHome(role) })} className="cursor-pointer gap-2 text-primary font-medium">
                      <LayoutDashboard className="h-4 w-4" /> Workspace Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer gap-2 text-destructive focus:text-destructive">
                    <LogOut className="h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => nav({ to: "/login" })}>
                Sign in
              </Button>
              <Button size="sm" onClick={() => nav({ to: "/register" })}>
                Get started
              </Button>
            </>
          )}

          {/* Mobile hamburger button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile navigation menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-2">
            {!hideNav && (
              <>
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                >
                  <BookOpen className="h-4 w-4 text-muted-foreground" /> Courses
                </Link>
                <Link
                  to="/instructors"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                >
                  <Users className="h-4 w-4 text-muted-foreground" /> Instructors
                </Link>
                <Link
                  to="/verify-certificate"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                >
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" /> Verify Certificate
                </Link>
              </>
            )}
            {isAuthenticated && (
              <>
                <Link
                  to="/my/enrollments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                >
                  <BookOpen className="h-4 w-4 text-muted-foreground" /> My Learning
                </Link>
                <Link
                  to="/my/payments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                >
                  <CreditCard className="h-4 w-4 text-muted-foreground" /> Payments
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
                >
                  <User className="h-4 w-4 text-muted-foreground" /> Profile
                </Link>
                {role === "INSTRUCTOR" && (
                  <Link
                    to="/instructor"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
                  >
                    <LayoutDashboard className="h-4 w-4" /> Instructor Studio
                  </Link>
                )}
                {role === "ADMIN" && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
                  >
                    <ShieldCheck className="h-4 w-4" /> Admin Panel
                  </Link>
                )}
                <div className="pt-2 border-t border-border">
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </>
            )}
            {!isAuthenticated && (
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <Button variant="outline" size="sm" onClick={() => { setMobileMenuOpen(false); nav({ to: "/login" }); }}>
                  Sign in
                </Button>
                <Button size="sm" onClick={() => { setMobileMenuOpen(false); nav({ to: "/register" }); }}>
                  Get started
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
