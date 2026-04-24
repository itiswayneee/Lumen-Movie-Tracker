import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Settings, Flame, Sparkles, Film, Bookmark, Eye, Lightbulb, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MovieGrid } from "@/components/movie/MovieGrid";
import { MovieDetailDialog } from "@/components/movie/MovieDetailDialog";
import { SettingsDialog } from "@/components/movie/SettingsDialog";
import {
  fetchPopular,
  fetchTrending,
  fetchRecommendations,
  fetchWatched,
  fetchWatchlist,
  getClientId,
  searchMovies,
  isAuthenticated,
  type TraktMovie,
  type TraktShow,
  type SearchItem,
} from "@/lib/trakt";

const Index = () => {
  const [hasKey, setHasKey] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [selected, setSelected] = useState<TraktMovie | null>(null);
  const [tab, setTab] = useState("trending");
  const [expandedIcon, setExpandedIcon] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Lumen — Cinematic Movie Tracker";
    const id = getClientId();
    setHasKey(!!id);
    setIsAuthed(isAuthenticated());
    if (!id) setSettingsOpen(true);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 350);
    return () => clearTimeout(t);
  }, [query]);

  const isSearching = debounced.length >= 2;

  const trending = useQuery({
    queryKey: ["trending"],
    queryFn: () => fetchTrending(30),
    enabled: hasKey && !isSearching,
    staleTime: 5 * 60 * 1000,
  });

  const popular = useQuery({
    queryKey: ["popular"],
    queryFn: () => fetchPopular(30),
    enabled: hasKey && !isSearching && tab === "popular",
    staleTime: 5 * 60 * 1000,
  });

  const search = useQuery({
    queryKey: ["search", debounced],
    queryFn: () => searchMovies(debounced, 30),
    enabled: hasKey && isSearching,
    staleTime: 60 * 1000,
  });

  const watchlist = useQuery({
    queryKey: ["watchlist"],
    queryFn: () => fetchWatchlist(50),
    enabled: isAuthed && !isSearching && tab === "watchlist",
    staleTime: 60 * 1000,
  });

  const watched = useQuery({
    queryKey: ["watched"],
    queryFn: () => fetchWatched(50),
    enabled: isAuthed && !isSearching && tab === "watched",
    staleTime: 60 * 1000,
  });

  const recommendations = useQuery({
    queryKey: ["recommendations"],
    queryFn: () => fetchRecommendations(30),
    enabled: isAuthed && !isSearching && tab === "recommendations",
    staleTime: 5 * 60 * 1000,
  });

  const trendingItems = useMemo(
    () =>
      (trending.data ?? []).map((t) => ({
        movie: t.movie,
        watchers: t.watchers,
      })),
    [trending.data],
  );

  const popularItems = useMemo(
    () => (popular.data ?? []).map((m) => ({ movie: m })),
    [popular.data],
  );

  const searchItems = useMemo(
    () => (search.data ?? []).filter((s) => s.movie).map((s) => ({ movie: s.movie })),
    [search.data],
  );

  const watchlistItems = useMemo(
    () => (watchlist.data ?? []).filter((w) => w.movie?.ids).map((w) => ({ movie: w.movie })),
    [watchlist.data],
  );

  const watchedItems = useMemo(
    () => (watched.data ?? []).filter((w) => w.movie?.ids).map((w) => ({ movie: w.movie })),
    [watched.data],
  );

  const recommendationItems = useMemo(
    () => (recommendations.data ?? []).filter((r) => r.movie?.ids).map((r) => ({ movie: r.movie })),
    [recommendations.data],
  );

  const handleSaved = () => {
    setHasKey(!!getClientId());
    setIsAuthed(isAuthenticated());
  };

  const tabs = [
    { value: "trending", label: "Trending", icon: Flame },
    { value: "popular", label: "Popular", icon: Sparkles },
    ...(isAuthed
      ? [
          { value: "watchlist", label: "Watchlist", icon: Bookmark },
          { value: "watched", label: "Watched", icon: Eye },
          { value: "recommendations", label: "For You", icon: Lightbulb },
        ]
      : []),
  ] as const;

  return (
    <div className="grain relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute -left-32 top-20 h-96 w-96 rounded-full bg-primary/20 blur-3xl animate-float" />
      <div
        className="pointer-events-none absolute right-0 top-96 h-[28rem] w-[28rem] rounded-full bg-accent/20 blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />

      <header className="sticky top-0 z-40 px-4 py-4 sm:px-8">
        <div className="glass mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-[0_0_20px_hsl(186_100%_60%/0.5)]">
              <Film className="h-5 w-5 text-background" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              Lumen
            </span>
            <span className="hidden text-xs text-muted-foreground sm:inline">
              {isAuthed ? "· signed in" : "· powered by Trakt"}
            </span>
          </div>
          {!isAuthed && hasKey && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettingsOpen(true)}
              className="text-primary hover:text-primary-glow"
            >
              <LogIn className="mr-1 h-4 w-4" />
              Sign In
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            className="hover:bg-white/10"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-3 pb-20 sm:px-8">
        <section className="pb-8 pt-8 text-center sm:pt-20">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted-foreground backdrop-blur animate-fade-in">
            <Sparkles className="h-3 w-3 text-primary" />
            {isAuthed ? "Personalized for you" : "Discover what the world is watching"}
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight sm:text-6xl md:text-7xl animate-fade-up">
            Track every <span className="text-gradient-neon">cinematic</span>
            <br />
            moment.
          </h1>
          <p
            className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg animate-fade-up"
            style={{ animationDelay: "120ms" }}
          >
            {isAuthed
              ? "Your watchlist, watched history, and personalized recommendations."
              : "A glass-finished movie tracker powered by the Trakt API."}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 animate-fade-up" style={{ animationDelay: "200ms" }}>
            {tabs.map((t) => (
              <button
                key={t.value}
                onClick={() => {
                  setTab(t.value);
                  setExpandedIcon(expandedIcon === t.value ? null : t.value);
                }}
                className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all ${
                  tab === t.value
                    ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_0_20px_hsl(186_100%_60%/0.4)]"
                    : "glass hover:bg-white/10"
                }`}
              >
                <t.icon className="h-4 w-4" />
                <span className={`text-sm font-medium transition-all ${
                  expandedIcon === t.value || !expandedIcon ? "opacity-100 max-w-24" : "max-w-0 opacity-0"
                } overflow-hidden whitespace-nowrap`}>
                  {t.label}
                </span>
              </button>
            ))}
          </div>

          <div
            className="mx-auto mt-8 max-w-xl animate-fade-up"
            style={{ animationDelay: "240ms" }}
          >
            <div className="glass group flex items-center gap-3 rounded-2xl px-4 py-2 transition-all focus-within:shadow-[0_0_30px_hsl(186_100%_60%/0.35)] focus-within:ring-1 focus-within:ring-primary/60">
              <Search className="h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search any movie title..."
                className="border-0 bg-transparent text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </section>

        {!hasKey ? (
          <div className="glass mx-auto max-w-md rounded-2xl p-8 text-center">
            <h3 className="mb-2 font-display text-xl font-semibold">
              Add your Trakt Client ID
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              It's free and takes 30 seconds. Your key stays in your browser.
            </p>
            <Button
              onClick={() => setSettingsOpen(true)}
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
            >
              Set up
            </Button>
          </div>
        ) : isSearching ? (
          <section>
            <SectionHeader
              icon={<Search className="h-4 w-4" />}
              title={`Results for "${debounced}"`}
              count={searchItems.length}
            />
            {search.isLoading ? (
              <GridSkeleton />
            ) : search.error ? (
              <ErrorBox message={(search.error as Error).message} />
            ) : searchItems.length === 0 ? (
              <EmptyBox message="No movies found." />
            ) : (
              <MovieGrid
                items={searchItems}
                onSelect={(m) => setSelected(m)}
              />
            )}
          </section>
        ) : (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="mb-6 flex h-11 flex-nowrap overflow-x-auto rounded-full border-white/10 bg-white/5 p-1 scrollbar-hide">
              {tabs.map((t) => (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="shrink-0 rounded-full px-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-accent data-[state=active]:text-primary-foreground data-[state=active]:shadow-[0_0_20px_hsl(186_100%_60%/0.4)]"
                >
                  <t.icon className="mr-1.5 h-4 w-4" />
                  <span className="hidden xs:inline">{t.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="trending" className="mt-0">
              {trending.isLoading ? (
                <GridSkeleton />
              ) : trending.error ? (
                <ErrorBox message={(trending.error as Error).message} />
              ) : (
                <MovieGrid
                  items={trendingItems}
                  onSelect={(m) => setSelected(m)}
                />
              )}
            </TabsContent>

            <TabsContent value="popular" className="mt-0">
              {popular.isLoading ? (
                <GridSkeleton />
              ) : popular.error ? (
                <ErrorBox message={(popular.error as Error).message} />
              ) : (
                <MovieGrid
                  items={popularItems}
                  onSelect={(m) => setSelected(m)}
                />
              )}
            </TabsContent>

            {isAuthed && (
              <>
                <TabsContent value="watchlist" className="mt-0">
                  {watchlist.isLoading ? (
                    <GridSkeleton />
                  ) : watchlist.error ? (
                    <ErrorBox message={(watchlist.error as Error).message} />
                  ) : watchlistItems.length === 0 ? (
                    <EmptyBox message="Your watchlist is empty. Add movies to watch later!" />
                  ) : (
                    <MovieGrid
                      items={watchlistItems}
                      onSelect={(m) => setSelected(m)}
                    />
                  )}
                </TabsContent>

                <TabsContent value="watched" className="mt-0">
                  {watched.isLoading ? (
                    <GridSkeleton />
                  ) : watched.error ? (
                    <ErrorBox message={(watched.error as Error).message} />
                  ) : watchedItems.length === 0 ? (
                    <EmptyBox message="No watched movies yet. Mark movies as watched to see them here!" />
                  ) : (
                    <MovieGrid
                      items={watchedItems}
                      onSelect={(m) => setSelected(m)}
                    />
                  )}
                </TabsContent>

                <TabsContent value="recommendations" className="mt-0">
                  {recommendations.isLoading ? (
                    <GridSkeleton />
                  ) : recommendations.error ? (
                    <ErrorBox message={(recommendations.error as Error).message} />
                  ) : recommendationItems.length === 0 ? (
                    <EmptyBox message="No recommendations yet. Watch more movies to get personalized suggestions!" />
                  ) : (
                    <MovieGrid
                      items={recommendationItems}
                      onSelect={(m) => setSelected(m)}
                    />
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        )}
      </main>

      <MovieDetailDialog
        movie={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSaved={handleSaved}
      />
    </div>
  );
};

const SectionHeader = ({
  icon,
  title,
  count,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
}) => (
  <div className="mb-6 flex items-center gap-3">
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      {icon} {title}
    </div>
    {count !== undefined && (
      <span className="text-xs text-muted-foreground/60">{count}</span>
    )}
  </div>
);

const GridSkeleton = () => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
    {Array.from({ length: 12 }).map((_, i) => (
      <div key={i} className="space-y-3">
        <Skeleton className="aspect-[2/3] w-full rounded-2xl bg-white/5" />
        <Skeleton className="h-4 w-3/4 bg-white/5" />
        <Skeleton className="h-3 w-1/3 bg-white/5" />
      </div>
    ))}
  </div>
);

const ErrorBox = ({ message }: { message: string }) => (
  <div className="glass rounded-2xl p-6 text-center text-sm text-destructive">
    {message}
  </div>
);

const EmptyBox = ({ message }: { message: string }) => (
  <div className="glass rounded-2xl p-12 text-center text-sm text-muted-foreground">
    {message}
  </div>
);

export default Index;