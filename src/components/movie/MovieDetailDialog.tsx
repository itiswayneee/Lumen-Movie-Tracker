import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Star, Clock, Calendar, ExternalLink, Play, Bookmark, Eye, Check, Loader2, 
  Users, Clapperboard, Tv, ChevronDown, ChevronRight, Film
} from "lucide-react";
import { 
  resolveBackdrop, resolvePoster, isAuthenticated, isInWatchlist, isWatched, 
  addToWatchlist, removeFromWatchlist, markAsWatched, 
  fetchCast, fetchCrew, fetchSeasons, fetchSeasonEpisodes,
  type TraktMovie, type TraktShow, type TraktSeason, type TraktEpisode, type CastMember
} from "@/lib/trakt";
import { toast } from "sonner";

interface Props {
  movie: TraktMovie | TraktShow | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export const MovieDetailDialog = ({ movie, open, onOpenChange }: Props) => {
  const [backdrop, setBackdrop] = useState<string | null>(null);
  const [poster, setPoster] = useState<string | null>(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watched, setWatched] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "cast" | "seasons">("overview");
  const [expandedSeason, setExpandedSeason] = useState<number | null>(null);
  const [expandedEpisode, setExpandedEpisode] = useState<number | null>(null);

  const isMovie = "released" in (movie || {});

  const cast = useQuery({
    queryKey: ["cast", movie?.ids.trakt, isMovie ? "movies" : "shows"],
    queryFn: () => fetchCast(movie!.ids.trakt, isMovie ? "movies" : "shows"),
    enabled: !!movie && open,
    staleTime: 10 * 60 * 1000,
  });

  const crew = useQuery({
    queryKey: ["crew", movie?.ids.trakt, isMovie ? "movies" : "shows"],
    queryFn: () => fetchCrew(movie!.ids.trakt, isMovie ? "movies" : "shows"),
    enabled: !!movie && open,
    staleTime: 10 * 60 * 1000,
  });

  const seasons = useQuery({
    queryKey: ["seasons", movie?.ids.trakt],
    queryFn: () => fetchSeasons(movie!.ids.trakt),
    enabled: !!movie && !isMovie && open,
    staleTime: 10 * 60 * 1000,
  });

  const seasonEpisodes = useQuery({
    queryKey: ["seasonEpisodes", movie?.ids.trakt, expandedSeason],
    queryFn: () => fetchSeasonEpisodes(movie!.ids.trakt, expandedSeason!),
    enabled: !!movie && !isMovie && expandedSeason !== null,
    staleTime: 5 * 60 * 1000,
  });

  const addToWatchlistMutation = useMutation({
    mutationFn: () => addToWatchlist({ ids: { trakt: movie!.ids.trakt } }),
    onSuccess: () => {
      setInWatchlist(true);
      toast.success("Added to watchlist");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: () => removeFromWatchlist(movie!.ids.trakt),
    onSuccess: () => {
      setInWatchlist(false);
      toast.success("Removed from watchlist");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const markWatchedMutation = useMutation({
    mutationFn: () => markAsWatched({ ids: { trakt: movie!.ids.trakt } }),
    onSuccess: () => {
      setWatched(true);
      toast.success("Marked as watched");
    },
    onError: (e) => toast.error((e as Error).message),
  });

  useEffect(() => {
    if (!movie) return;
    const tmdbId = (movie as TraktMovie).ids.tmdb || (movie as TraktShow).ids.tmdb;
    resolveBackdrop(tmdbId).then(setBackdrop);
    resolvePoster(tmdbId).then(setPoster);
    setInWatchlist(false);
    setWatched(false);
    setLoadingStatus(true);
    setActiveTab("overview");
    setExpandedSeason(null);
    setExpandedEpisode(null);

    if (isAuthenticated()) {
      Promise.all([isInWatchlist(movie.ids.trakt), isWatched(movie.ids.trakt)])
        .then(([wl, w]) => {
          setInWatchlist(wl);
          setWatched(w);
        })
        .finally(() => setLoadingStatus(false));
    } else {
      setLoadingStatus(false);
    }
  }, [movie]);

  const handleAddToWatchlist = () => {
    if (!isAuthenticated()) {
      toast.error("Please sign in to manage your watchlist");
      return;
    }
    if (inWatchlist) {
      removeFromWatchlistMutation.mutate();
    } else {
      addToWatchlistMutation.mutate();
    }
  };

  const handleMarkWatched = () => {
    if (!isAuthenticated()) {
      toast.error("Please sign in to mark as watched");
      return;
    }
    markWatchedMutation.mutate();
  };

  const toggleSeason = (seasonNum: number) => {
    if (expandedSeason === seasonNum) {
      setExpandedSeason(null);
    } else {
      setExpandedSeason(seasonNum);
      setExpandedEpisode(null);
    }
  };

  const toggleEpisode = (epNum: number) => {
    setExpandedEpisode(expandedEpisode === epNum ? null : epNum);
  };

  if (!movie) return null;

  const isAdding = addToWatchlistMutation.isPending || removeFromWatchlistMutation.isPending;
  const isMarking = markWatchedMutation.isPending;
  const title = movie.title;
  const year = movie.year;
  const runtime = movie.runtime;
  const rating = movie.rating;
  const votes = movie.votes;
  const genres = movie.genres;
  const overview = movie.overview;
  const tagline = "tagline" in movie ? movie.tagline : undefined;
  const trailer = movie.trailer;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong max-w-4xl overflow-hidden border-white/10 p-0 max-h-[90vh]">
        <DialogTitle className="sr-only">{title}</DialogTitle>

        <div className="relative h-44 w-full sm:h-56">
          {backdrop ? (
            <img src={backdrop} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-primary/20 via-accent/10 to-background" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
        </div>

        <ScrollArea className="max-h-[calc(90vh-12rem)]">
          <div className="relative -mt-20 px-4 pb-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              <div className="flex-shrink-0 self-center sm:self-auto">
                <div className="h-36 w-24 overflow-hidden rounded-xl border border-white/10 shadow-elevated sm:h-52 sm:w-36">
                  {poster ? (
                    <img src={poster} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary text-center text-sm text-muted-foreground p-2">
                      {title}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-xs">
                    {isMovie ? <Film className="h-3 w-3" /> : <Tv className="h-3 w-3" />}
                    {isMovie ? "Movie" : "TV Series"}
                  </span>
                  {movie.status && !isMovie && (
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                      {movie.status}
                    </span>
                  )}
                </div>

                <h2 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
                  {title}
                </h2>
                {tagline && (
                  <p className="text-sm italic text-muted-foreground">"{tagline}"</p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> {year}
                  </span>
                  {runtime && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" /> {runtime} min
                    </span>
                  )}
                  {rating && rating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-primary text-primary" />
                      {rating.toFixed(1)}
                      <span className="text-xs">({votes?.toLocaleString()})</span>
                    </span>
                  )}
                </div>

                {genres && genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {genres.map((g) => (
                      <Badge key={g} className="border-primary/30 bg-primary/10 text-primary">
                        {g}
                      </Badge>
                    ))}
                  </div>
                )}

                {overview && (
                  <p className="text-sm leading-relaxed text-foreground/90 line-clamp-3">
                    {overview}
                  </p>
                )}

                {!isMovie && seasons.data && seasons.data.length > 0 && (
                  <div className="flex gap-2 border-t border-white/10 pt-3">
                    <Button
                      variant={activeTab === "overview" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab("overview")}
                      className="text-xs"
                    >
                      Overview
                    </Button>
                    <Button
                      variant={activeTab === "cast" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab("cast")}
                      className="text-xs"
                    >
                      <Users className="mr-1 h-3 w-3" /> Cast
                    </Button>
                    <Button
                      variant={activeTab === "seasons" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab("seasons")}
                      className="text-xs"
                    >
                      <Tv className="mr-1 h-3 w-3" /> Seasons ({seasons.data.length})
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-4">
              {activeTab === "cast" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-sm font-semibold flex items-center gap-2">
                      <Users className="h-4 w-4" /> Cast
                    </h3>
                    {cast.isLoading ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                      </div>
                    ) : cast.data && cast.data.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                        {cast.data.slice(0, 12).map((person: CastMember, i) => (
                          <div key={i} className="flex items-center gap-2 rounded-lg bg-white/5 p-2">
                            {person.person.headshot ? (
                              <img 
                                src={person.person.headshot} 
                                alt={person.person.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-white/10" />
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{person.person.name}</p>
                              <p className="truncate text-xs text-muted-foreground">{person.character}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No cast information available.</p>
                    )}
                  </div>

                  {(crew.data?.directors?.length || crew.data?.writers?.length) && (
                    <div>
                      <h3 className="mb-2 text-sm font-semibold flex items-center gap-2">
                        <Clapperboard className="h-4 w-4" /> Crew
                      </h3>
                      <div className="space-y-2">
                        {crew.data.directors?.length > 0 && (
                          <div className="rounded-lg bg-white/5 p-3">
                            <p className="text-xs text-muted-foreground mb-1">Directors</p>
                            <p className="text-sm">{crew.data.directors.map(d => d.person.name).join(", ")}</p>
                          </div>
                        )}
                        {crew.data.writers?.length > 0 && (
                          <div className="rounded-lg bg-white/5 p-3">
                            <p className="text-xs text-muted-foreground mb-1">Writers</p>
                            <p className="text-sm">{crew.data.writers.map(w => w.person.name).join(", ")}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "seasons" && !isMovie && seasons.data && (
                <div className="space-y-2">
                  {seasons.data.map((season: TraktSeason) => (
                    <div key={season.season} className="rounded-xl bg-white/5 overflow-hidden">
                      <button
                        onClick={() => toggleSeason(season.season)}
                        className="flex w-full items-center justify-between p-3 text-left hover:bg-white/5"
                      >
                        <div className="flex items-center gap-2">
                          {expandedSeason === season.season ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <span className="font-medium">Season {season.season}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {season.episode_count || 0} episodes
                        </span>
                      </button>
                      {expandedSeason === season.season && (
                        <div className="border-t border-white/10 px-3 pb-3">
                          {seasonEpisodes.isLoading ? (
                            <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                            </div>
                          ) : seasonEpisodes.data && seasonEpisodes.data.length > 0 ? (
                            <div className="space-y-1 pt-2">
                              {seasonEpisodes.data.map((ep: TraktEpisode) => (
                                <div key={ep.episode}>
                                  <button
                                    onClick={() => toggleEpisode(ep.episode)}
                                    className="flex w-full items-start gap-2 rounded-lg p-2 text-left hover:bg-white/5"
                                  >
                                    {expandedEpisode === ep.episode ? (
                                      <ChevronDown className="mt-0.5 h-3 w-3 shrink-0" />
                                    ) : (
                                      <ChevronRight className="mt-0.5 h-3 w-3 shrink-0" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium">
                                        {ep.episode}. {ep.title}
                                      </p>
                                      {expandedEpisode !== ep.episode && ep.overview && (
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                          {ep.overview}
                                        </p>
                                      )}
                                    </div>
                                  </button>
                                  {expandedEpisode === ep.episode && ep.overview && (
                                    <div className="ml-5 rounded-lg bg-white/5 p-2 text-sm text-muted-foreground">
                                      {ep.overview}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="py-2 text-sm text-muted-foreground">No episodes available.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "overview" && (
                <div className="flex flex-wrap gap-2">
                  {trailer && (
                    <Button
                      asChild
                      className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
                    >
                      <a href={trailer} target="_blank" rel="noreferrer">
                        <Play className="mr-1 h-4 w-4" /> Trailer
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleAddToWatchlist}
                    disabled={isAdding}
                  >
                    {isAdding ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : inWatchlist ? (
                      <Check className="mr-1 h-4 w-4" />
                    ) : (
                      <Bookmark className="mr-1 h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">{inWatchlist ? "In Watchlist" : "Watchlist"}</span>
                    <span className="sm:hidden">{inWatchlist ? "Added" : "+"}</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleMarkWatched}
                    disabled={isMarking || watched}
                  >
                    {isMarking ? (
                      <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    ) : watched ? (
                      <Check className="mr-1 h-4 w-4" />
                    ) : (
                      <Eye className="mr-1 h-4 w-4" />
                    )}
                    <span>{watched ? "Watched" : "Mark Watched"}</span>
                  </Button>
                </div>
              )}

              {activeTab === "overview" && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    asChild
                    variant="outline"
                    className="border-white/15"
                  >
                    <a
                      href={`https://trakt.tv/${isMovie ? "movies" : "shows"}/${movie.ids.slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="mr-1 h-4 w-4" /> Trakt
                    </a>
                  </Button>
                  {movie.ids.imdb && (
                    <Button
                      asChild
                      variant="outline"
                      className="border-white/15"
                    >
                      <a
                        href={`https://imdb.com/title/${movie.ids.imdb}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        IMDb
                      </a>
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};