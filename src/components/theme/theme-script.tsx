/**
 * Inline theme bootstrapper.
 *
 * Sits in <head> and is executed before paint, so the user never sees a wrong
 * theme flash (FOUC). Reads localStorage("nd-theme") and falls back to the
 * system preference. Setting "system" (or absent value) follows OS.
 */
const SCRIPT = `
(function () {
  try {
    var KEY = "nd-theme";
    var saved = localStorage.getItem(KEY);
    var theme = saved || "system";
    var resolved =
      theme === "system"
        ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
        : theme;
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.style.colorScheme = resolved;
  } catch (_) {
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();
`.trim();

export function ThemeScript() {
  return <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
