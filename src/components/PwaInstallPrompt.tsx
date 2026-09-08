import { useEffect, useState } from "react";
import { Download, X, WifiOff, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [isIos, setIsIos] = useState(false);
  const [showIosPrompt, setShowIosPrompt] = useState(false);

  useEffect(() => {
    // Check online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    // Check iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Capture beforeinstallprompt for Android & Desktop Chrome/Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Register Service Worker if supported
    if ("serviceWorker" in navigator && process.env.NODE_ENV !== "test") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] ServiceWorker registered with scope:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] ServiceWorker registration failed:", err);
        });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIos) {
        setShowIosPrompt(true);
      }
      return;
    }

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <>
      {/* Offline Alert Strip */}
      {isOffline && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 shadow-lg backdrop-blur-md text-amber-900 dark:text-amber-200 flex items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-2 font-medium">
            <WifiOff className="h-4 w-4 shrink-0 text-amber-500 animate-pulse" />
            <span>You're offline. Previously loaded courses are accessible.</span>
          </div>
          <button
            onClick={() => setIsOffline(false)}
            className="text-amber-700 dark:text-amber-300 hover:opacity-75"
            aria-label="Dismiss offline banner"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* PWA Install Banner */}
      {isInstallable && !isDismissed && (
        <aside
          aria-label="Install App Banner"
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-xl border border-border bg-card/95 p-3.5 shadow-2xl backdrop-blur-md sm:bottom-6 sm:right-6 sm:left-auto"
        >
          <div className="flex items-center gap-3">
            <img
              src="/icons/icon-192x192.png"
              alt="Lumen LMS Logo"
              className="h-10 w-10 rounded-lg shadow-sm shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-foreground">Install Lumen LMS</h4>
              <p className="text-[11px] text-muted-foreground truncate">
                Install as a native app for faster learning and offline access.
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Button
                size="sm"
                onClick={handleInstallClick}
                className="h-8 gap-1.5 px-3 text-xs font-medium"
              >
                <Download className="h-3.5 w-3.5" />
                Install
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDismissed(true)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                aria-label="Close install prompt"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </aside>
      )}

      {/* iOS Safari Instructions Sheet Modal */}
      {showIosPrompt && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Install on iOS</h3>
              </div>
              <button
                onClick={() => setShowIosPrompt(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs text-muted-foreground">
              <p>To install Lumen LMS on your iPhone or iPad:</p>
              <ol className="list-decimal list-inside space-y-2 text-foreground font-medium">
                <li>Tap the <span className="font-semibold text-primary">Share</span> button in Safari's bottom toolbar.</li>
                <li>Scroll down and tap <span className="font-semibold text-primary">Add to Home Screen</span>.</li>
                <li>Confirm by tapping <span className="font-semibold text-primary">Add</span> in the top right.</li>
              </ol>
            </div>
            <Button
              className="w-full h-8 text-xs"
              onClick={() => setShowIosPrompt(false)}
            >
              Got it
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
