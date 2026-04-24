import { Star, Clock } from "lucide-react";
import { MoviePoster } from "./MoviePoster";
import type { TraktMovie } from "@/lib/trakt";

interface Props {
  movie: TraktMovie;
  watchers?: number;
  onClick: () => void;
  index?: number;
}

export const MovieCard = ({ movie, watchers, onClick, index = 0 }: Props) => {
  return (
    <button
      onClick={onClick}
      style={{ animationDelay: `${Math.min(index * 40, 600)}ms` }}
      className="group relative flex flex-col gap-3 text-left animate-fade-up focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-2xl"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl">
        <MoviePoster movie={movie} className="h-full w-full" />
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 transition-all duration-500 group-hover:ring-primary/60 group-hover:shadow-[0_0_30px_hsl(186_100%_60%/0.5)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

        {typeof movie.rating === "number" && movie.rating > 0 && (
          <div className="absolute right-2 top-2 glass flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
            <Star className="h-3 w-3 fill-primary text-primary" />
            {movie.rating.toFixed(1)}
          </div>
        )}

        {watchers !== undefined && (
          <div className="absolute left-2 top-2 glass rounded-full px-2.5 py-1 text-xs font-medium text-primary">
            🔥 {watchers.toLocaleString()}
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          {movie.runtime && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {movie.runtime} min
            </div>
          )}
        </div>
      </div>

      <div className="px-1">
        <h3 className="line-clamp-1 font-semibold text-foreground transition-colors group-hover:text-primary">
          {movie.title}
        </h3>
        <p className="text-sm text-muted-foreground">{movie.year}</p>
      </div>
    </button>
  );
};