"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";

/**
 * Toaster wrapper that follows the active app theme — re-renders sonner with
 * the correct visual style whenever <html data-theme> changes.
 */
export function AppToaster() {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    function read() {
      const t = document.documentElement.getAttribute("data-theme");
      setTheme(t === "light" ? "light" : "dark");
    }
    read();

    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return <Toaster theme={theme} richColors position="top-right" />;
}
