import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  Circle,
  FileText,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStore } from "@/lib/store";
import { NAV_GROUPS } from "@/lib/navigation-data";
import { ARTICLES } from "@/lib/library";
import { GLOSSARY_TERMS } from "@/lib/support-data";

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { state } = useStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName))
      ) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const allTools = useMemo(() => {
    const list: Array<{
      to: string;
      label: string;
      group: string;
      description?: string;
      icon: React.ComponentType<{ className?: string }>;
    }> = [];
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        list.push({
          to: item.to,
          label: item.label,
          group: group.title,
          description: item.description,
          icon: item.icon,
        });
      }
    }
    // Add extra reference tools
    list.push({
      to: "/glossary",
      label: "Plain-English Glossary",
      group: "Learn & settings",
      description: "Definitions of DNS, MX, SSL, and domain terms",
      icon: BookOpen,
    });
    list.push({
      to: "/troubleshooting",
      label: "Troubleshooting Guide",
      group: "Learn & settings",
      description: "Quick fixes for common setup errors",
      icon: HelpCircle,
    });
    return list;
  }, []);

  const tasks = useMemo(() => {
    return state.tasks.slice(0, 15);
  }, [state.tasks]);

  const handleSelect = (to: string) => {
    setOpen(false);
    navigate({ to: to as never });
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="relative h-9 w-full justify-start text-xs text-muted-foreground sm:w-60 md:w-72"
      >
        <Search className="mr-2 size-3.5" aria-hidden="true" />
        <span className="inline-flex truncate">Find a tool, task, or answer…</span>
        <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-0.5 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
          ⌘K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type to search tools, tasks, guides, or definitions…" />
        <CommandList className="max-h-[380px]">
          <CommandEmpty>No matching tools, tasks, or answers found.</CommandEmpty>

          <CommandGroup heading="Tools & Workspaces">
            {allTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <CommandItem
                  key={tool.to}
                  value={`${tool.label} ${tool.group} ${tool.description ?? ""}`}
                  onSelect={() => handleSelect(tool.to)}
                  className="flex items-center justify-between gap-2 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                      <Icon className="size-3.5" />
                    </span>
                    <div className="truncate">
                      <p className="text-xs font-semibold leading-tight text-foreground">
                        {tool.label}
                      </p>
                      {tool.description && (
                        <p className="truncate text-[11px] text-muted-foreground">
                          {tool.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-[10px] py-0 font-normal">
                    {tool.group}
                  </Badge>
                </CommandItem>
              );
            })}
          </CommandGroup>

          {tasks.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Launch Tasks">
                {tasks.map((task) => {
                  const isDone = task.status === "complete";
                  let targetRoute = "/checklist";
                  if (task.phase === "domain") targetRoute = "/domains";
                  else if (task.phase === "platform") targetRoute = "/platform-matcher";
                  else if (task.phase === "content") targetRoute = "/content";
                  else if (task.phase === "email") targetRoute = "/business-email";
                  else if (task.phase === "dns") targetRoute = "/connect-domain";
                  else if (task.phase === "review") targetRoute = "/preflight";
                  else if (task.phase === "growth") targetRoute = "/get-found";

                  return (
                    <CommandItem
                      key={task.id}
                      value={`task ${task.title} ${task.description}`}
                      onSelect={() => handleSelect(targetRoute)}
                      className="flex items-center justify-between gap-2 px-3 py-2"
                    >
                      <div className="flex items-center gap-2 truncate">
                        {isDone ? (
                          <CheckCircle2 className="size-3.5 shrink-0 text-success" />
                        ) : (
                          <Circle className="size-3.5 shrink-0 text-muted-foreground" />
                        )}
                        <span
                          className={`text-xs truncate ${isDone ? "line-through text-muted-foreground" : "font-medium"}`}
                        >
                          {task.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0 uppercase">
                        {isDone ? "Done" : "To do"}
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </>
          )}

          <CommandSeparator />
          <CommandGroup heading="Learning Library Articles">
            {ARTICLES.slice(0, 10).map((article) => (
              <CommandItem
                key={article.slug}
                value={`article guide ${article.title} ${article.summary} ${article.category}`}
                onSelect={() => handleSelect("/learn")}
                className="flex items-center justify-between gap-2 px-3 py-2"
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="size-3.5 shrink-0 text-primary" />
                  <div className="truncate">
                    <p className="text-xs font-medium truncate">{article.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{article.summary}</p>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {article.minutes}m
                </span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />
          <CommandGroup heading="Plain-English Glossary">
            {GLOSSARY_TERMS.slice(0, 10).map((term) => (
              <CommandItem
                key={term.term}
                value={`glossary definition ${term.term} ${term.definition}`}
                onSelect={() => handleSelect("/glossary")}
                className="flex flex-col items-start gap-0.5 px-3 py-2"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-xs font-semibold text-primary">{term.term}</span>
                  <span className="text-[10px] text-muted-foreground">{term.category}</span>
                </div>
                <p className="line-clamp-1 text-[11px] text-muted-foreground">{term.definition}</p>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
