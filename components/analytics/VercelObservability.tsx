"use client";

import { useEffect, useState, type ComponentProps } from "react";
import { Analytics, type BeforeSend as AnalyticsBeforeSend } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { readConsent, subscribeConsent } from "@/src/privacy/consent";
import { sanitizeTelemetryEvent } from "@/src/privacy/telemetry";

type SpeedInsightsBeforeSend = NonNullable<ComponentProps<typeof SpeedInsights>["beforeSend"]>;

const analyticsBeforeSend: AnalyticsBeforeSend = (event) => sanitizeTelemetryEvent(event);
const speedInsightsBeforeSend: SpeedInsightsBeforeSend = (event) => sanitizeTelemetryEvent(event);

export default function VercelObservability() {
  const [ready, setReady] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const apply = () => {
      const current = readConsent();
      setAnalyticsEnabled(Boolean(current?.analytics));
    };
    apply();
    const unsubscribe = subscribeConsent(() => apply());
    setReady(true);
    return unsubscribe;
  }, []);

  if (!ready || !analyticsEnabled) return null;

  return (
    <>
      <Analytics debug={false} beforeSend={analyticsBeforeSend} />
      <SpeedInsights debug={false} beforeSend={speedInsightsBeforeSend} />
    </>
  );
}
