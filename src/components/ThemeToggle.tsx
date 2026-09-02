import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { THEME_OPTIONS, useTheme, type ThemeChoice } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeIcon({ choice, className }: { choice: ThemeChoice; className?: string }) {
  const Icon = choice === "light" ? Sun : choice === "dark" ? Moon : Monitor;
  return <Icon className={cn("size-4.5", className)} aria-hidden="true" />;
}

/** Compact menu trigger: works on desktop and mobile navigation. */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const activeLabel = THEME_OPTIONS.find((o) => o.value === theme)?.label ?? "System";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("min-h-11 min-w-11", className)}
          aria-label={`Change color theme. Current setting: ${activeLabel}`}
        >
          <ThemeIcon choice={resolvedTheme} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Color theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as ThemeChoice)}>
          {THEME_OPTIONS.map((o) => (
            <DropdownMenuRadioItem key={o.value} value={o.value}>
              <span className="flex items-center gap-2">
                <ThemeIcon choice={o.value} className="size-4" />
                {o.label}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
        <DropdownMenuItem disabled className="text-xs">
          Currently showing: {resolvedTheme === "dark" ? "Dark" : "Light"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Inline segmented control, for mobile menus and settings-like contexts. */
export function ThemeMenu({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  return (
    <div className={cn("space-y-2", className)}>
      <p className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        Color theme
      </p>
      <div
        role="radiogroup"
        aria-label="Color theme"
        className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1"
      >
        {THEME_OPTIONS.map((o) => {
          const active = theme === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(o.value)}
              className={cn(
                "flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg px-2 py-2 text-xs font-medium transition-colors",
                active
                  ? "bg-card text-foreground shadow-soft ring-1 ring-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <ThemeIcon choice={o.value} className="size-4" />
              {o.value === "system" ? "System" : o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Full Appearance card used on the Settings page. */
export function ThemeSettingsCard() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  return (
    <section className="surface-panel space-y-4 p-5 sm:p-6">
      <div>
        <h2 className="font-display text-xl font-bold">Appearance</h2>
        <p className="text-sm text-muted-foreground">
          Choose how Cornerstone looks on this device.
        </p>
      </div>
      <div role="radiogroup" aria-label="Appearance" className="grid gap-3 sm:grid-cols-3">
        {THEME_OPTIONS.map((o) => {
          const active = theme === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setTheme(o.value)}
              className={cn(
                "flex flex-col gap-1.5 rounded-xl border p-4 text-left transition-colors",
                active
                  ? "border-primary bg-primary-soft/60 ring-2 ring-primary/40"
                  : "border-border bg-card hover:bg-muted",
              )}
            >
              <span className="flex items-center gap-2 font-semibold">
                <ThemeIcon choice={o.value} />
                {o.label}
              </span>
              <span className="text-xs text-muted-foreground">{o.hint}</span>
              <span className="text-xs font-medium text-primary">
                {active ? "Selected" : "\u00a0"}
              </span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Currently showing the {resolvedTheme === "dark" ? "dark" : "light"} theme. Your choice is
        saved on this device only.
      </p>
    </section>
  );
}
