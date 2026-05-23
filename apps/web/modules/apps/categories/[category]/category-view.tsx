"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { SkeletonText } from "@calcom/ui/components/skeleton";
import { AppCard } from "@calcom/web/modules/apps/components/AppCard";
import type { CategoryDataProps } from "@lib/apps/categories/[category]/getStaticProps";
import { ArrowRight, Cpu, MessageSquare, Phone, Play, Sparkles, Video, Volume2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Shell from "~/shell/Shell";

export default function Apps({ apps, category }: CategoryDataProps) {
  const { t, isLocaleReady } = useLocale();
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Auto-animate conversation bubble steps
  useEffect(() => {
    if (category !== "automation") return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, [category]);

  const isAutomation = category === "automation";

  if (isAutomation) {
    return (
      <Shell
        isPublic
        backPath="/apps"
        title="Planxo IA - Appels & Automatisation"
        description="Propulsez vos prises de rendez-vous avec des agents vocaux intelligents."
        smallHeading
        heading={
          <>
            <Link
              href="/apps"
              className="inline-flex items-center justify-start gap-1 rounded-sm py-2 text-emphasis">
              {isLocaleReady ? t("app_store") : <SkeletonText className="h-4 w-24" />}{" "}
            </Link>
            <span className="gap-1 text-default">
              <span>&nbsp;/&nbsp;</span>
              Planxo IA
            </span>
          </>
        }>
        <div className="mb-20 space-y-16">
          {/* Main Planxo IA Hero Section */}
          <div className="relative overflow-hidden rounded-3xl border border-amber-900/30 bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/20 p-8 shadow-2xl md:p-12">
            {/* Glowing ambient lights */}
            <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-yellow-600/5 blur-3xl" />

            <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
              {/* Left Column: Rebranded Premium Sales Pitch */}
              <div className="space-y-6 lg:col-span-7">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 font-semibold text-amber-500 text-xs uppercase tracking-wider">
                  <Sparkles size={14} className="animate-pulse" />
                  Propulsé par Planxo IA
                </div>
                <h1 className="font-bold font-cal text-3xl text-white leading-tight tracking-tight md:text-5xl">
                  Prises de rendez-vous{" "}
                  <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500 bg-clip-text text-transparent">
                    ultra-rapides
                  </span>{" "}
                  grâce aux appels IA
                </h1>
                <p className="text-base text-stone-300 leading-relaxed md:text-lg">
                  Transformez vos réservations en conversations naturelles. Planxo IA utilise des agents
                  vocaux intelligents et ultra-réalistes pour planifier vos réunions, envoyer des rappels et
                  assurer des suivis par téléphone afin de maximiser vos conversions et éliminer les absences.
                </p>

                <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                  <button
                    onClick={() => {
                      const element = document.getElementById("available-apps-list");
                      if (element) element.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-3.5 font-bold text-black text-sm shadow-lg transition-all hover:scale-[1.02] hover:shadow-amber-500/20">
                    <Sparkles size={16} />
                    Essayer la planification IA
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </button>
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-700 bg-stone-900/60 px-6 py-3.5 font-semibold text-sm text-white backdrop-blur-sm transition-colors hover:bg-stone-800">
                    <Play size={16} />
                    Voir en action
                  </button>
                </div>

                <div className="pt-2 text-stone-400 text-xs italic">
                  * Connectez simplement vos comptes Retell AI, Synthflow ou Bolna pour activer Planxo IA.
                </div>
              </div>

              {/* Right Column: Premium Interactive Phone Call Simulation */}
              <div className="lg:col-span-5">
                <div className="relative mx-auto max-w-[340px] rounded-[40px] border-[6px] border-stone-800 bg-stone-950 p-6 shadow-2xl ring-1 ring-stone-700/50">
                  {/* Phone Speaker & Camera cutouts */}
                  <div className="absolute top-2 left-1/2 h-4 w-28 -translate-x-1/2 rounded-full bg-stone-800" />

                  {/* Phone Header */}
                  <div className="mt-4 flex items-center justify-between font-medium text-stone-500 text-xs">
                    <span>9:41</span>
                    <div className="flex items-center gap-1.5">
                      <Volume2 size={12} className="text-amber-500" />
                      <span>Planxo.ia</span>
                    </div>
                  </div>

                  {/* Caller Details */}
                  <div className="my-6 space-y-1 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 ring-2 ring-amber-500/20">
                      <Phone size={24} className="animate-bounce" />
                    </div>
                    <div className="pt-2 font-semibold text-stone-400 text-xs uppercase tracking-widest">
                      Appel IA Entrant
                    </div>
                    <div className="font-bold text-lg text-white">Sophie (Planxo IA)</div>
                    <div className="flex items-center justify-center gap-1 font-medium text-amber-500 text-xs">
                      <span className="h-1.5 w-1.5 animate-ping rounded-full bg-amber-500" />
                      +1 (418) 555-0199
                    </div>
                  </div>

                  {/* Conversation Dialogue Mockup (with fade-in highlight effects) */}
                  <div className="scrollbar-none h-[230px] space-y-3.5 overflow-y-auto rounded-2xl border border-stone-800/40 bg-stone-900/40 p-4 text-xs">
                    <div
                      className={`space-y-1 transition-all duration-500 ${activeStep === 0 ? "scale-100 opacity-100" : "opacity-40"}`}>
                      <div className="font-semibold text-amber-400">Planxo IA</div>
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 text-white leading-relaxed">
                        "Bonjour! Ici Sophie de Planxo IA. Comment allez-vous aujourd'hui?"
                      </div>
                    </div>

                    <div
                      className={`space-y-1 transition-all duration-500 ${activeStep === 1 ? "scale-100 opacity-100" : "opacity-40"}`}>
                      <div className="text-right font-semibold text-stone-400">Moi</div>
                      <div className="rounded-lg bg-stone-800 p-2.5 text-right text-stone-200 leading-relaxed">
                        "Bonjour Sophie, je vais très bien merci! Et vous?"
                      </div>
                    </div>

                    <div
                      className={`space-y-1 transition-all duration-500 ${activeStep === 2 ? "scale-100 opacity-100" : "opacity-40"}`}>
                      <div className="font-semibold text-amber-400">Planxo IA</div>
                      <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5 text-white leading-relaxed">
                        "Je vais à merveille, merci! Je vous appelle pour confirmer notre rencontre de demain
                        à 14h. Est-ce que cela vous convient toujours?"
                      </div>
                    </div>

                    <div
                      className={`space-y-1 transition-all duration-500 ${activeStep === 3 ? "scale-100 opacity-100" : "opacity-40"}`}>
                      <div className="text-right font-semibold text-stone-400">Moi</div>
                      <div className="rounded-lg bg-stone-800 p-2.5 text-right text-stone-200 leading-relaxed">
                        "Oui absolument, c'est noté dans mon agenda!"
                      </div>
                    </div>
                  </div>

                  {/* Phone Footer Interface */}
                  <div className="mt-6 flex justify-around border-stone-800/80 border-t pt-4 text-stone-400">
                    <div className="flex cursor-pointer flex-col items-center gap-1 hover:text-white">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-800 bg-stone-900 hover:bg-stone-800">
                        <Volume2 size={16} />
                      </div>
                      <span className="text-[10px]">Audio</span>
                    </div>
                    <div className="flex cursor-pointer flex-col items-center gap-1 hover:text-white">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-800 bg-stone-900 hover:bg-stone-800">
                        <MessageSquare size={16} />
                      </div>
                      <span className="text-[10px]">Clavier</span>
                    </div>
                    <div className="flex cursor-pointer flex-col items-center gap-1 hover:text-white">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-800 bg-stone-900 hover:bg-stone-800">
                        <Phone size={16} className="rotate-[135deg] text-red-500" />
                      </div>
                      <span className="text-[10px]">Raccrocher</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Video Promo Player / Interactive Simulation Overlay */}
          {isPlaying && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
              <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-stone-800 bg-stone-950 p-1 shadow-2xl">
                <button
                  onClick={() => setIsPlaying(false)}
                  className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-stone-900/80 text-white hover:bg-stone-800">
                  ✕
                </button>
                <div className="aspect-video w-full">
                  <iframe
                    className="h-full w-full rounded-xl"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                    title="Planxo IA Demo"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          )}

          {/* See the AI Phone Agent Section */}
          <div className="mx-auto max-w-2xl space-y-6 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/20 bg-amber-500/10 text-amber-500">
              <Video size={20} />
            </div>
            <h2 className="font-bold font-cal text-2xl text-white md:text-3xl">
              Voyez l'agent vocal en action
            </h2>
            <p className="text-sm text-stone-400 leading-relaxed md:text-base">
              Découvrez comment Planxo IA automatise intégralement la confirmation de vos rendez-vous, les
              suivis et la détection d'absences en temps réel, sans aucune action requise de votre part.
            </p>
            <div>
              <button
                onClick={() => setIsPlaying(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-bold text-black text-sm shadow-md transition-all hover:scale-[1.02] hover:bg-amber-400">
                <Play size={16} fill="black" />
                Lancer la démo Planxo IA
              </button>
            </div>
          </div>

          {/* App List section divider */}
          <div id="available-apps-list" className="space-y-6 border-stone-900 border-t pt-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <h3 className="flex items-center gap-2 font-bold font-cal text-white text-xl">
                  <Cpu className="text-amber-500" size={20} />
                  Intégrations & Connexions Planxo IA
                </h3>
                <p className="text-sm text-stone-400">
                  Activez Planxo IA en installant l'un de nos partenaires de téléphonie intelligente
                  ci-dessous.
                </p>
              </div>
            </div>

            {/* Render the standard app cards underneath the premium landing banner */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {apps
                ?.sort((a, b) => (b.installCount || 0) - (a.installCount || 0))
                .map((app) => {
                  return <AppCard key={app.slug} app={app} />;
                })}
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  // Fallback default simple grid view for all other categories
  return (
    <Shell
      isPublic
      backPath="/apps"
      title={t("app_store")}
      description={t("app_store_description")}
      smallHeading
      heading={
        <>
          <Link
            href="/apps"
            className="inline-flex items-center justify-start gap-1 rounded-sm py-2 text-emphasis">
            {isLocaleReady ? t("app_store") : <SkeletonText className="h-4 w-24" />}{" "}
          </Link>
          {category && (
            <span className="gap-1 text-default">
              <span>&nbsp;/&nbsp;</span>
              {t("category_apps", { category: category[0].toUpperCase() + category?.slice(1) })}
            </span>
          )}
        </>
      }>
      <div className="mb-16">
        <div className="grid-col-1 grid grid-cols-1 gap-3 md:grid-cols-3">
          {apps
            ?.sort((a, b) => (b.installCount || 0) - (a.installCount || 0))
            .map((app) => {
              return <AppCard key={app.slug} app={app} />;
            })}
        </div>
      </div>
    </Shell>
  );
}
