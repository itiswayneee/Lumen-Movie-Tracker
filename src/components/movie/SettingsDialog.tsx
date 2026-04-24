import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearAuthTokens,
  getAuthUrl,
  getClientId,
  getClientSecret,
  getTmdbKey,
  isAuthenticated,
  setClientId,
  setClientSecret,
  setTmdbKey,
} from "@/lib/trakt";
import { ExternalLink, LogOut, User } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSaved: () => void;
}

export const SettingsDialog = ({ open, onOpenChange, onSaved }: Props) => {
  const [trakt, setTrakt] = useState(getClientId());
  const [traktSecret, setTraktSecret] = useState(getClientSecret());
  const [tmdb, setTmdb] = useState(getTmdbKey());
  const [isLoggedIn, setIsLoggedIn] = useState(isAuthenticated());

  const save = () => {
    if (!trakt.trim()) {
      toast.error("Trakt Client ID is required");
      return;
    }
    setClientId(trakt);
    setClientSecret(traktSecret);
    setTmdbKey(tmdb);
    setIsLoggedIn(isAuthenticated());
    toast.success("Saved");
    onSaved();
  };

  const handleSignIn = () => {
    if (!trakt.trim() || !traktSecret.trim()) {
      toast.error("Client ID and Secret are required for sign in");
      return;
    }
    setClientId(trakt);
    setClientSecret(traktSecret);
    try {
      const url = getAuthUrl();
      window.location.href = url;
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleSignOut = () => {
    clearAuthTokens();
    setIsLoggedIn(false);
    toast.success("Signed out");
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-strong border-white/10 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">API Keys</DialogTitle>
          <DialogDescription>
            Stored locally in your browser. Never sent anywhere except the
            providers' APIs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="trakt">
              Trakt Client ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="trakt"
              value={trakt}
              onChange={(e) => setTrakt(e.target.value)}
              placeholder="Paste your Trakt Client ID"
              className="bg-white/5 border-white/10"
            />
            <a
              href="https://trakt.tv/oauth/applications/new"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-glow"
            >
              Get one free <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <div className="space-y-2">
            <Label htmlFor="traktSecret">Trakt Client Secret</Label>
            <Input
              id="traktSecret"
              value={traktSecret}
              onChange={(e) => setTraktSecret(e.target.value)}
              placeholder="Paste your Client Secret"
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tmdb">TMDB API Key (optional, for posters)</Label>
            <Input
              id="tmdb"
              value={tmdb}
              onChange={(e) => setTmdb(e.target.value)}
              placeholder="TMDB v3 API key"
              className="bg-white/5 border-white/10"
            />
            <a
              href="https://www.themoviedb.org/settings/api"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-glow"
            >
              Get one free <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <Button
            onClick={save}
            className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-[0_0_20px_hsl(186_100%_60%/0.4)]"
          >
            Save Keys
          </Button>

          <div className="border-t border-white/10 pt-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="flex-1 text-sm text-muted-foreground">
                  <User className="mr-1 inline h-4 w-4" />
                  Signed in
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="border-white/15 bg-white/5 hover:bg-white/10"
                >
                  <LogOut className="mr-1 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleSignIn}
                disabled={!trakt.trim() || !traktSecret.trim()}
                className="w-full"
                variant="outline"
              >
                <User className="mr-2 h-4 w-4" />
                Sign in with Trakt
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};