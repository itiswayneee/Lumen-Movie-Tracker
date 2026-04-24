import { MovieCard } from "./MovieCard";
import type { TraktMovie } from "@/lib/trakt";

interface GridItem {
  movie: TraktMovie;
  watchers?: number;
}

interface Props {
  items: GridItem[];
  onSelect: (m: TraktMovie) => void;
}

export const MovieGrid = ({ items, onSelect }: Props) => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
    {items.filter(item => item?.movie?.ids).map((item, i) => (
      <MovieCard
        key={item.movie.ids.trakt}
        movie={item.movie}
        watchers={item.watchers}
        onClick={() => onSelect(item.movie)}
        index={i}
      />
    ))}
  </div>
);