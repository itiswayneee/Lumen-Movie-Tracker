const TRAKT_BASE = "https://api.trakt.tv";
const TMDB_IMG = "https://image.tmdb.org/t/p";

export type TraktMovie = {
  title: string;
  year: number;
  ids: {
    trakt: number;
    slug: string;
    imdb?: string;
    tmdb?: number;
  };
  overview?: string;
  tagline?: string;
  runtime?: number;
  rating?: number;
  votes?: number;
  genres?: string[];
  certification?: string;
  released?: string;
  trailer?: string;
  homepage?: string;
};

export type TraktShow = {
  title: string;
  year: number;
  ids: {
    trakt: number;
    slug: string;
    imdb?: string;
    tvdb?: number;
    tvrage?: number;
  };
  overview?: string;
  runtime?: number;
  rating?: number;
  votes?: number;
  genres?: string[];
  certification?: string;
  premiered?: string;
  trailer?: string;
  homepage?: string;
  status?: string;
  episodes?: number;
  seasons?: TraktSeason[];
};

export type TraktSeason = {
  season: number;
  ids: {
    trakt: number;
    tvdb?: number;
    tmdb?: number;
  };
  episode_count?: number;
  episodes?: TraktEpisode[];
  overview?: string;
  network?: string;
};

export type TraktEpisode = {
  season: number;
  episode: number;
  ids: {
    trakt: number;
    tvdb?: number;
    imdb?: string;
    tmdb?: number;
  };
  title?: string;
  overview?: string;
  aired?: string;
  runtime?: number;
  rating?: number;
  votes?: number;
  thumbnail?: string;
};

export type TrendingItem = { watchers: number; movie: TraktMovie };
export type SearchItem = { type: string; score: number; movie: TraktMovie; show?: TraktShow };
export type WatchlistMovie = { added_at: string; movie: TraktMovie };
export type WatchedMovie = { plays: number; last_watched_at: string; last_updated_at: string; movie: TraktMovie };
export type RecommendedMovie = { show_counter: number; movie: TraktMovie };

export type CastMember = {
  character: string;
  person: {
    name: string;
    ids: {
      trakt: number;
      imdb?: string;
      tvrage?: number;
    };
    headshot?: string;
  };
};

export type CrewMember = {
  job: string;
  person: {
    name: string;
    ids: {
      trakt: number;
      imdb?: string;
    };
    headshot?: string;
  };
};

const CLIENT_ID_KEY = "trakt_client_id";
const CLIENT_SECRET_KEY = "trakt_client_secret";
const ACCESS_TOKEN_KEY = "trakt_access_token";
const REFRESH_TOKEN_KEY = "trakt_refresh_token";
const TOKEN_EXPIRES_KEY = "trakt_token_expires";

export const getClientId = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(CLIENT_ID_KEY) || "";
};

export const setClientId = (id: string) => {
  localStorage.setItem(CLIENT_ID_KEY, id.trim());
};

export const getClientSecret = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(CLIENT_SECRET_KEY) || "";
};

export const setClientSecret = (secret: string) => {
  localStorage.setItem(CLIENT_SECRET_KEY, secret.trim());
};

export const getAccessToken = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(ACCESS_TOKEN_KEY) || "";
};

export const setAccessToken = (token: string, expiresIn: number) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  const expiresAt = Date.now() + expiresIn * 1000;
  localStorage.setItem(TOKEN_EXPIRES_KEY, expiresAt.toString());
};

export const getRefreshToken = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(REFRESH_TOKEN_KEY) || "";
};

export const setRefreshToken = (token: string) => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token.trim());
};

export const getTokenExpiresAt = () => {
  if (typeof window === "undefined") return 0;
  const val = localStorage.getItem(TOKEN_EXPIRES_KEY);
  return val ? parseInt(val, 10) : 0;
};

export const isTokenExpired = () => {
  const expiresAt = getTokenExpiresAt();
  return !expiresAt || Date.now() >= expiresAt - 60000;
};

export const clearAuthTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRES_KEY);
};

export const isAuthenticated = () => {
  return !!getAccessToken() && !isTokenExpired();
};

const headers = () => {
  const id = getClientId();
  if (!id) throw new Error("Missing Trakt Client ID. Add it in settings.");
  return {
    "Content-Type": "application/json",
    "trakt-api-version": "2",
    "trakt-api-key": id,
  };
};

const authHeaders = () => {
  const token = getAccessToken();
  if (!token || isTokenExpired()) throw new Error("Not authenticated. Please sign in.");
  return {
    ...headers(),
    Authorization: `Bearer ${token}`,
  };
};

async function traktFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${TRAKT_BASE}${path}`, { headers: headers() });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error("Invalid Trakt Client ID.");
    }
    throw new Error(`Trakt request failed (${res.status}).`);
  }
  return res.json();
}

async function authFetch<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch(`${TRAKT_BASE}${path}`, {
    method,
    headers: authHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      throw new Error("Authentication expired. Please sign in again.");
    }
    if (res.status === 404) {
      throw new Error("Not found.");
    }
    throw new Error(`Trakt request failed (${res.status}).`);
  }
  if (res.status === 204) {
    return {} as T;
  }
  return res.json();
}

export const fetchTrending = (limit = 24) =>
  traktFetch<TrendingItem[]>(`/movies/trending?limit=${limit}&extended=full`);

export const fetchPopular = (limit = 24) =>
  traktFetch<TraktMovie[]>(`/movies/popular?limit=${limit}&extended=full`);

export const searchMovies = (query: string, limit = 24) =>
  traktFetch<SearchItem[]>(
    `/search/movie,show?query=${encodeURIComponent(query)}&limit=${limit}&extended=full`,
  );

export const fetchMovieDetails = (idOrSlug: string | number) =>
  traktFetch<TraktMovie>(`/movies/${idOrSlug}?extended=full`);

export const fetchShowDetails = (idOrSlug: string | number) =>
  traktFetch<TraktShow>(`/shows/${idOrSlug}?extended=full`);

export const fetchCast = (idOrSlug: string | number, type: "movies" | "shows" = "movies") =>
  traktFetch<CastMember[]>(`/${type}/${idOrSlug}/casting`);

export const fetchCrew = (idOrSlug: string | number, type: "movies" | "shows" = "movies") =>
  traktFetch<{ directors: CrewMember[]; writers: CrewMember[] }>(`/${type}/${idOrSlug}/crew`);

export const fetchSeasons = (idOrSlug: string | number) =>
  traktFetch<TraktSeason[]>(`/shows/${idOrSlug}/seasons?extended=full`);

export const fetchSeasonEpisodes = (idOrSlug: string | number, season: number) =>
  traktFetch<TraktEpisode[]>(`/shows/${idOrSlug}/seasons/${season}?extended=full`);

export const fetchWatchlist = (limit = 30) =>
  authFetch<WatchlistMovie[]>(`/sync/watchlist?limit=${limit}&extended=full`);

export const addToWatchlist = (movie: { ids: { trakt: number } }) =>
  authFetch("/sync/watchlist", "POST", { movies: [movie] });

export const removeFromWatchlist = (traktId: number) =>
  authFetch("/sync/watchlist/remove", "POST", { movies: [{ ids: { trakt: traktId } }] });

export const fetchWatched = (limit = 30) =>
  authFetch<WatchedMovie[]>(`/sync/watched/movies?limit=${limit}&extended=full`);

export const markAsWatched = (movie: { ids: { trakt: number } }) =>
  authFetch("/sync/history", "POST", { movies: [movie] });

export const fetchRecommendations = (limit = 30) =>
  authFetch<RecommendedMovie[]>(`/recommendations/movies?limit=${limit}&extended=full`);

export const isInWatchlist = async (traktId: number): Promise<boolean> => {
  try {
    const watchlist = await fetchWatchlist(100);
    return watchlist.some((item) => item.movie.ids.trakt === traktId);
  } catch {
    return false;
  }
};

export const isWatched = async (traktId: number): Promise<boolean> => {
  try {
    const watched = await fetchWatched(100);
    return watched.some((item) => item.movie.ids.trakt === traktId);
  } catch {
    return false;
  }
};

export const exchangeToken = async (code: string): Promise<{ access_token: string; refresh_token: string; expires_in: number }> => {
  const id = getClientId();
  const secret = getClientSecret();
  if (!id || !secret) throw new Error("Missing Client ID or Secret.");

  const res = await fetch(`${TRAKT_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": id,
    },
    body: JSON.stringify({
      code,
      client_id: id,
      client_secret: secret,
      redirect_uri: `${window.location.origin}/callback`,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error_description || "Failed to exchange token.");
  }

  const data = await res.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_in: data.expires_in,
  };
};

export const refreshAccessToken = async (): Promise<{ access_token: string; expires_in: number }> => {
  const id = getClientId();
  const secret = getClientSecret();
  const refreshToken = getRefreshToken();
  if (!id || !secret || !refreshToken) throw new Error("Missing credentials.");

  const res = await fetch(`${TRAKT_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "trakt-api-version": "2",
      "trakt-api-key": id,
    },
    body: JSON.stringify({
      refresh_token: refreshToken,
      client_id: id,
      client_secret: secret,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    clearAuthTokens();
    throw new Error("Failed to refresh token.");
  }

  const data = await res.json();
  return {
    access_token: data.access_token,
    expires_in: data.expires_in,
  };
};

export const getAuthUrl = () => {
  const id = getClientId();
  if (!id) throw new Error("Missing Client ID.");
  const state = Math.random().toString(36).substring(2, 15);
  localStorage.setItem("trakt_oauth_state", state);
  const redirectUri = `${window.location.origin}/callback`;
  return `https://trakt.tv/oauth/authorize?response_type=code&client_id=${id}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
};

export const getStoredState = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("trakt_oauth_state") || "";
};

export const clearStoredState = () => {
  localStorage.removeItem("trakt_oauth_state");
};

const TMDB_KEY_STORAGE = "tmdb_api_key";
export const getTmdbKey = () => localStorage.getItem(TMDB_KEY_STORAGE) || "";
export const setTmdbKey = (k: string) => localStorage.setItem(TMDB_KEY_STORAGE, k.trim());

export const tmdbPoster = (tmdbId?: number, size: "w342" | "w500" | "w780" = "w500") => {
  if (!tmdbId) return null;
  return `https://www.themoviedb.org/t/p/${size}_filter(duotone,000000,ffffff)/movie/${tmdbId}`;
};

const posterCache = new Map<number, string | null>();
export async function resolvePoster(tmdbId?: number): Promise<string | null> {
  if (!tmdbId) return null;
  if (posterCache.has(tmdbId)) return posterCache.get(tmdbId)!;
  const key = getTmdbKey();
  if (!key) {
    posterCache.set(tmdbId, null);
    return null;
  }
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${key}`,
    );
    if (!res.ok) {
      posterCache.set(tmdbId, null);
      return null;
    }
    const data = await res.json();
    const path = data.poster_path
      ? `${TMDB_IMG}/w500${data.poster_path}`
      : null;
    posterCache.set(tmdbId, path);
    return path;
  } catch {
    posterCache.set(tmdbId, null);
    return null;
  }
}

export async function resolveBackdrop(tmdbId?: number): Promise<string | null> {
  if (!tmdbId) return null;
  const key = getTmdbKey();
  if (!key) return null;
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${key}`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.backdrop_path ? `${TMDB_IMG}/w1280${data.backdrop_path}` : null;
  } catch {
    return null;
  }
}