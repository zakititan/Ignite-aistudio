import { BookOpen, ExternalLink, PlayCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { VisualResource } from "@/lib/library";

function youtubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    const videoId = parsed.searchParams.get("v");
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

export function VisualResourceCard({ resource }: { resource: VisualResource }) {
  const [playing, setPlaying] = useState(false);
  const embedUrl = resource.kind === "Video" ? youtubeEmbedUrl(resource.url) : null;

  return (
    <article className="rounded-lg border p-4 transition-colors hover:bg-muted/60">
      <div className="flex items-center justify-between gap-2">
        <Badge variant="outline">
          <span className="mr-1 inline-flex">
            {resource.kind === "Video" ? (
              <PlayCircle className="size-3" />
            ) : (
              <BookOpen className="size-3" />
            )}
          </span>
          {resource.kind}
        </Badge>
        <a
          href={resource.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${resource.title} in a new tab`}
          className="rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
        </a>
      </div>

      {playing && embedUrl ? (
        <div className="mt-3 overflow-hidden rounded-md bg-black shadow-sm">
          <div className="aspect-video">
            <iframe
              className="size-full"
              src={embedUrl}
              title={resource.title}
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
      ) : null}

      <h3 className="mt-3 font-display font-semibold">{resource.title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{resource.description}</p>
      <p className="mt-2 text-xs text-primary/80">Think of it like: {resource.analogy}</p>
      <p className="mt-2 text-xs text-muted-foreground">Topics: {resource.topics.join(" · ")}</p>

      {embedUrl ? (
        <Button
          type="button"
          size="sm"
          variant={playing ? "secondary" : "default"}
          className="mt-3"
          onClick={() => setPlaying((current) => !current)}
          aria-expanded={playing}
        >
          <PlayCircle className="mr-1 size-4" />
          {playing ? "Hide video" : "Watch here"}
        </Button>
      ) : null}
    </article>
  );
}
