"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ConsentSource, ConsentState } from "@/src/privacy/consent";
import { onOpenPrivacySettings, readConsent, saveConsent, subscribeConsent } from "@/src/privacy/consent";

function ConsentSettings({
  analyticsEnabled,
  setAnalyticsEnabled,
}: {
  analyticsEnabled: boolean;
  setAnalyticsEnabled: (enabled: boolean) => void;
}) {
  return (
    <div className="space-y-3 rounded-md border border-border p-3">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <Label htmlFor="consent-necessary">Strictly necessary</Label>
          <p className="text-xs text-muted-foreground">Required for core app behavior and reliability.</p>
        </div>
        <Switch id="consent-necessary" checked disabled aria-label="Necessary cookies enabled" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <Label htmlFor="consent-analytics">Analytics</Label>
          <p className="text-xs text-muted-foreground">Helps measure usage and performance with Vercel tooling.</p>
        </div>
        <Switch
          id="consent-analytics"
          checked={analyticsEnabled}
          onCheckedChange={setAnalyticsEnabled}
          aria-label="Enable analytics"
        />
      </div>
    </div>
  );
}

export default function ConsentManager() {
  const [ready, setReady] = useState(false);
  const [consent, setConsent] = useState<ConsentState | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const initial = readConsent();
    setConsent(initial);
    setAnalyticsEnabled(Boolean(initial?.analytics));
    setReady(true);

    const unsubscribeConsent = subscribeConsent((next) => {
      setConsent(next);
      setAnalyticsEnabled(Boolean(next?.analytics));
    });
    const unsubscribeOpen = onOpenPrivacySettings(() => {
      const current = readConsent();
      setAnalyticsEnabled(Boolean(current?.analytics));
      setSettingsOpen(true);
    });
    return () => {
      unsubscribeConsent();
      unsubscribeOpen();
    };
  }, []);

  const persist = (analytics: boolean, source: ConsentSource) => {
    const next = saveConsent({ analytics, source });
    setConsent(next);
    setAnalyticsEnabled(next.analytics);
    setSettingsOpen(false);
  };

  const showBanner = ready && !consent;

  return (
    <>
      {showBanner ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-foreground">
              We use necessary storage for app functionality. Analytics is optional and disabled until you choose.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setSettingsOpen(true)}>
                Manage
              </Button>
              <Button variant="outline" size="sm" onClick={() => persist(false, "banner")}>
                Reject analytics
              </Button>
              <Button size="sm" onClick={() => persist(true, "banner")}>
                Accept analytics
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Privacy and Cookie Settings</DialogTitle>
            <DialogDescription>Choose whether optional analytics and performance tracking are enabled.</DialogDescription>
          </DialogHeader>

          <ConsentSettings analyticsEnabled={analyticsEnabled} setAnalyticsEnabled={setAnalyticsEnabled} />

          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" onClick={() => persist(false, "settings")}>
              Reject analytics
            </Button>
            <Button variant="outline" onClick={() => persist(true, "settings")}>
              Accept analytics
            </Button>
            <Button onClick={() => persist(analyticsEnabled, "settings")}>Save selection</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

