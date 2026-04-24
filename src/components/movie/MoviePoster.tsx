import { useEffect, useState } from "react";
import { resolvePoster, type TraktMovie } from "@/lib/trakt";
import { Film } from "lucide-react";

interface Props {
  movie: TraktMovie;
  className?: string;
}

export const MoviePoster = ({ movie, className = "" }: Props) => {
  const [src, setSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    resolvePoster(movie.ids.tmdb).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => {
      cancelled = true;
    };
  }, [movie.ids.tmdb]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-secondary ${className}`}
    >
      {src ? (
        <img
          src={src}
          alt={`${movie.title} poster`}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-all duration-700 ${
            loaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-secondary to-muted p-4 text-center">
          <Film className="h-10 w-10 text-primary/60" />
          <span className="text-sm font-medium text-foreground/80 line-clamp-3">
            {movie.title}
          </span>
          <span className="text-xs text-muted-foreground">{movie.year}</span>
        </div>
      )}
    </div>
  );
};