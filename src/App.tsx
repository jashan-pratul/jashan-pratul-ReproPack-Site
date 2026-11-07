import { useEffect, useState } from "react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { CommandPalette, ShortcutsModal } from "./components/modals/Overlays";
import { PrivacyPage } from "./components/pages/PrivacyPage";
import { SupportPage } from "./components/pages/SupportPage";
import { Faq } from "./components/sections/Faq";
import { Features } from "./components/sections/Features";
import { Hero } from "./components/sections/Hero";
import { HowItWorks } from "./components/sections/HowItWorks";
import { Install } from "./components/sections/Install";
import { PlaygroundSection } from "./components/sections/PlaygroundSection";
import { Privacy } from "./components/sections/Privacy";
import { RedactionLab } from "./components/sections/RedactionLab";
import { Scope } from "./components/sections/Scope";
import { Support } from "./components/sections/Support";
import { ToastProvider } from "./components/ui/Toast";
import { SITE_CONFIG } from "./config/site";
import { hasModifier, isTypingTarget } from "./lib/keyboard";
import { normalizeRoute, useRoute } from "./lib/router";
import { PlaygroundProvider } from "./state/playground";

function SiteShell() {
  const route = useRoute();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  useEffect(() => {
    if (route === "/support") {
      document.title = `Support — ${SITE_CONFIG.name}`;
    } else if (route === "/privacy") {
      document.title = `Privacy Policy — ${SITE_CONFIG.name}`;
    } else {
      document.title = `${SITE_CONFIG.name} — ${SITE_CONFIG.tagline}`;
    }
  }, [route]);

  useEffect(() => {
    if (route !== "/" && route !== "/privacy") return;

    const alignToHash = () => {
      if (!window.location.hash) return;
      const id = window.location.hash.slice(1);
      if (!id || id === "top") return;
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "instant", block: "start" });
    };

    alignToHash();
    const rafId = window.requestAnimationFrame(alignToHash);

    const onPopState = () => {
      const current = normalizeRoute(window.location.pathname);
      if (current !== "/" && current !== "/privacy") return;
      const id = window.location.hash.slice(1);
      if (!id || id === "top") {
        window.scrollTo({ top: 0, behavior: "instant" });
        return;
      }
      document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "start" });
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("popstate", onPopState);
    };
  }, [route]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setShortcutsOpen(false);
        setPaletteOpen((v) => !v);
        return;
      }

      if (e.key === "Escape") {
        if (paletteOpen || shortcutsOpen) {
          e.preventDefault();
          setPaletteOpen(false);
          setShortcutsOpen(false);
        }
        return;
      }

      if (paletteOpen || shortcutsOpen) return;
      if (hasModifier(e) || isTypingTarget(e.target)) return;

      if (e.key === "?") {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      if (e.key === "/") {
        const input = document.getElementById("playground-search-input") as HTMLInputElement | null;
        if (!input) return;
        e.preventDefault();
        const section = document.getElementById("playground");
        if (section) {
          const rect = section.getBoundingClientRect();
          const inView = rect.top < window.innerHeight * 0.75 && rect.bottom > 160;
          if (!inView) {
            section.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
        input.focus({ preventScroll: true });
        input.select();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paletteOpen, shortcutsOpen]);

  return (
    <div className="page">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <Header onOpenPalette={() => setPaletteOpen(true)} />

      <main id="main-content">
        {route === "/support" ? (
          <SupportPage />
        ) : route === "/privacy" ? (
          <PrivacyPage />
        ) : (
          <>
            <Hero />
            <Scope />
            <PlaygroundSection onOpenShortcuts={() => setShortcutsOpen(true)} />
            <Features />
            <HowItWorks />
            <RedactionLab />
            <Privacy />
            <Install />
            <Faq />
            <Support />
          </>
        )}
      </main>

      <Footer onOpenShortcuts={() => setShortcutsOpen(true)} />

      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        onOpenShortcuts={() => {
          setPaletteOpen(false);
          setShortcutsOpen(true);
        }}
      />
      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}

export function App() {
  return (
    <ToastProvider>
      <PlaygroundProvider>
        <SiteShell />
      </PlaygroundProvider>
    </ToastProvider>
  );
}

export default App;
