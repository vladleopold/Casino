"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { adaptDemoUrlForDevice, type StorefrontGameLaunchContent } from "@slotcity/cms-sdk";

import { useSlotcityAccount } from "./account-context";
import { TrackedButton } from "./tracked-button";
import { TrackedLink } from "./tracked-link";

interface GameLauncherProps {
  slug: string;
  title: string;
  provider: string;
  heroImage?: string;
  launch: StorefrontGameLaunchContent;
}

export function GameLauncher({
  slug,
  title,
  provider,
  heroImage,
  launch
}: GameLauncherProps) {
  const { isAuthenticated, trackGameLaunch } = useSlotcityAccount();
  const launcherRef = useRef<HTMLElement>(null);
  const [isDemoLoaded, setIsDemoLoaded] = useState(false);
  const [hasAutoExpanded, setHasAutoExpanded] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [resolvedDemoSourceUrl, setResolvedDemoSourceUrl] = useState(launch.demoSourceUrl);
  const [isResolvingDemo, setIsResolvingDemo] = useState(false);
  const resolverBaseHref = `/api/games/demo?slug=${encodeURIComponent(slug)}&name=${encodeURIComponent(
    title
  )}`;
  const resolverRedirectHref = `${resolverBaseHref}&redirect=1`;
  const demoHref = resolvedDemoSourceUrl || launch.demoUrl || resolverRedirectHref;
  const demoEmbedSrc = resolvedDemoSourceUrl || launch.demoSourceUrl;
  const canEmbedDemo = Boolean(demoEmbedSrc);
  const hasRealLaunch = Boolean(launch.launchUrl);
  const requiresRegistrationGate = hasRealLaunch && launch.requiresAuth && !isAuthenticated;
  const externalTarget = launch.openInNewTab || launch.mode === "external" ? "_blank" : undefined;
  const externalRel = externalTarget === "_blank" ? "noreferrer" : undefined;
  const primaryHref = requiresRegistrationGate
    ? `/registration?game=${slug}`
    : hasRealLaunch
      ? launch.launchUrl || `/game/${slug}`
      : demoHref || `/registration?game=${slug}`;
  const primaryLabel = hasRealLaunch ? launch.launchLabel : demoHref ? "Відкрити демо" : launch.launchLabel;
  const primaryMode = hasRealLaunch ? "real" : demoHref ? "demo" : "real";
  const primaryPlacement = hasRealLaunch
    ? "game_launcher_real"
    : demoHref
      ? "game_launcher_demo_fallback"
      : "game_launcher_registration_fallback";
  const primaryTarget = hasRealLaunch && !requiresRegistrationGate ? externalTarget : undefined;
  const primaryRel = hasRealLaunch && !requiresRegistrationGate ? externalRel : undefined;
  const primarySuccess = hasRealLaunch
    ? !requiresRegistrationGate
    : Boolean(demoHref || demoEmbedSrc);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const isMobileDevice =
      window.innerWidth < 768 ||
      /android|iphone|ipad|ipod|mobile|iemobile|opera mini/i.test(window.navigator.userAgent);

    if (!isMobileDevice) {
      return;
    }

    const mobileDemoSourceUrl = adaptDemoUrlForDevice(launch.demoSourceUrl, "mobile");

    if (mobileDemoSourceUrl) {
      setResolvedDemoSourceUrl(mobileDemoSourceUrl);
    }
  }, [launch.demoSourceUrl]);

  useEffect(() => {
    if (launch.demoSourceUrl || resolvedDemoSourceUrl || typeof window === "undefined") {
      return;
    }

    let isActive = true;
    setIsResolvingDemo(true);

    void fetch(resolverBaseHref, {
      cache: "no-store"
    })
      .then(async (response) => {
        if (!response.ok) {
          return null;
        }

        const payload = (await response.json()) as {
          demoSourceUrl?: string;
        };

        if (isActive && payload.demoSourceUrl) {
          setResolvedDemoSourceUrl(payload.demoSourceUrl);
        }

        return null;
      })
      .catch(() => null)
      .finally(() => {
        if (isActive) {
          setIsResolvingDemo(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [launch.demoSourceUrl, resolvedDemoSourceUrl, resolverBaseHref]);

  useEffect(() => {
    if (!canEmbedDemo || !isDemoLoaded || hasAutoExpanded || typeof window === "undefined") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setIsTheaterMode(true);
      setHasAutoExpanded(true);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [canEmbedDemo, hasAutoExpanded, isDemoLoaded]);

  useEffect(() => {
    if (!isTheaterMode || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isTheaterMode]);

  useEffect(() => {
    if (!isTheaterMode || typeof window === "undefined") {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsTheaterMode(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isTheaterMode]);

  return (
    <section
      ref={launcherRef}
      className={`slotcity-game-launcher${isTheaterMode ? " is-theater" : ""}`}
    >
      {isTheaterMode ? (
        <button
          type="button"
          className="slotcity-game-launcher-backdrop"
          aria-label="Згорнути гру"
          onClick={() => setIsTheaterMode(false)}
        />
      ) : null}
      <div className="slotcity-game-launcher-surface">
        {canEmbedDemo ? (
          <div className="slotcity-game-launcher-embed">
            <iframe
              src={demoEmbedSrc}
              title={`${title} demo`}
              loading="lazy"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="slotcity-game-launcher-embed-frame is-demo"
              onLoad={() => setIsDemoLoaded(true)}
            />
          </div>
        ) : (
          <div className="slotcity-game-launcher-preview">
            {heroImage ? (
              <Image
                src={heroImage}
                alt={title}
                fill
                sizes="(max-width: 920px) 100vw, 640px"
                className="slotcity-game-launcher-preview-image"
              />
            ) : null}
            <div className="slotcity-game-launcher-preview-overlay" />
            <div className="slotcity-game-launcher-preview-copy">
              <span className="slotcity-section-kicker">{provider || "SlotCity"}</span>
              <strong>{title}</strong>
              <p>
                {canEmbedDemo
                  ? "Демо вже доступне прямо на сторінці. Реальний launcher також можна підключити в Directus."
                  : isResolvingDemo
                    ? "Підключаємо demo launcher. Зачекайте кілька секунд, і гра відкриється прямо на сторінці."
                    : demoHref
                      ? "Демо вже доступне через кнопку нижче. Реальний launcher також можна підключити в Directus."
                      : "Підключіть demo URL або real-money launcher у Directus, і ця зона почне відкривати гру прямо на сторінці."}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="slotcity-game-launcher-actions">
        <TrackedLink
          href={primaryHref}
          className="slotcity-cta slotcity-cta-primary"
          onClick={() => {
            void trackGameLaunch({
              slug,
              provider,
              mode: primaryMode,
              targetUrl: primaryHref,
              success: primarySuccess
            });
          }}
          event="cta_clicked"
          payload={{
            properties: {
              route: "game",
              placement: primaryPlacement,
              slug,
              label: primaryLabel
            }
          }}
          target={primaryTarget}
          rel={primaryRel}
        >
          {primaryLabel}
        </TrackedLink>
        {canEmbedDemo ? (
          <TrackedButton
            className="slotcity-cta slotcity-cta-secondary slotcity-game-launcher-passive"
            onClick={() => {
              setIsTheaterMode((current) => !current);
            }}
            event="cta_clicked"
            payload={{
              properties: {
                route: "game",
                placement: "game_launcher_fullscreen",
                slug,
                label: isTheaterMode ? "collapse" : "expand"
              }
            }}
          >
            {isTheaterMode ? "Згорнути" : "На весь екран"}
          </TrackedButton>
        ) : demoHref ? (
          <TrackedLink
            href={demoHref}
            className="slotcity-cta slotcity-cta-secondary"
            onClick={() => {
              void trackGameLaunch({
                slug,
                provider,
                mode: "demo",
                targetUrl: demoHref,
                success: true
              });
            }}
            event="cta_clicked"
            payload={{
              properties: {
                route: "game",
                placement: "game_launcher_demo",
                slug,
                label: launch.demoLabel
              }
            }}
          >
            {launch.demoLabel}
          </TrackedLink>
        ) : null}
      </div>
    </section>
  );
}
