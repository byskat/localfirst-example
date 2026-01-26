import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import Reveal from "reveal.js";
import { Atom, Moon, Sun } from "lucide-react";
import "reveal.js/dist/reveal.css";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/presentation")({
  component: PresentationPage,
});

function PresentationPage() {
  const deckRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<Reveal.Api | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!deckRef.current || revealRef.current) return;

    const deck = new Reveal(deckRef.current, {
      embedded: false,
      keyboardCondition: "focused",
      width: 1280,
      height: 720,
      margin: 0.1,
      minScale: 0.2,
      maxScale: 2.0,
      controls: true,
      progress: true,
      center: true,
      hash: true,
      transition: "slide",
      transitionSpeed: "default",
      backgroundTransition: "fade",
      slideNumber: "c/t",
    });

    deck.initialize().then(() => {
      revealRef.current = deck;
    });

    return () => {
      deck.destroy();
      revealRef.current = null;
    };
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Theme Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-4 right-4 z-50 rounded-full"
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>

      <style>{`
        .reveal {
          width: 100%;
          height: 100%;
        }
        .reveal .slides {
          text-align: left;
        }
        .reveal .controls {
          color: hsl(var(--primary));
        }
        .reveal .progress {
          background: hsl(var(--border));
        }
        .reveal .progress span {
          background: hsl(var(--primary));
        }
        .reveal .slide-number {
          color: hsl(var(--muted-foreground));
          background-color: hsl(var(--background) / 0.8);
        }
        .reveal .slides section {
          color: hsl(var(--foreground));
        }
      `}</style>
      <div ref={deckRef} className="reveal">
        <div className="slides">
          <section
            className="flex items-center justify-center"
            data-transition="zoom"
          >
            <div className="flex flex-col items-center text-center gap-6">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-4">
                <Atom className="w-12 h-12 text-primary" strokeWidth={1} />
              </div>
              <h1 className="text-6xl font-bold text-foreground">
                Arquitectura Local-First
              </h1>
              <p className="text-2xl text-muted-foreground max-w-2xl">
                Construint aplicacions que funcionen en qualsevol lloc
              </p>
              <p className="text-lg text-muted-foreground/70">
                Una introducció a Electric SQL i sincronització en temps real
              </p>
            </div>
          </section>

          <section
            className="flex items-center justify-center"
            data-transition="slide"
          >
            <div className="w-full px-20">
              <h2 className="text-5xl font-bold text-foreground mb-12 text-center">
                Què és Local-First?
              </h2>
              <div className="grid grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div
                  className="p-6 rounded-xl bg-card border border-border"
                  data-fragment-index="0"
                >
                  <div className="text-4xl mb-4">⚡</div>
                  <h3 className="text-2xl font-semibold mb-3">
                    Resposta Instantània
                  </h3>
                  <p className="text-muted-foreground">
                    Les dades viuen al dispositiu. Zero latència en totes les
                    operacions.
                  </p>
                </div>
                <div
                  className="fragment p-6 rounded-xl bg-card border border-border"
                  data-fragment-index="1"
                >
                  <div className="text-4xl mb-4">📱</div>
                  <h3 className="text-2xl font-semibold mb-3">
                    Funciona Offline
                  </h3>
                  <p className="text-muted-foreground">
                    L'aplicació segueix funcionant sense connexió. Les dades es
                    sincronitzen després.
                  </p>
                </div>
                <div
                  className="fragment p-6 rounded-xl bg-card border border-border"
                  data-fragment-index="2"
                >
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-2xl font-semibold mb-3">
                    Col·laboració Real
                  </h3>
                  <p className="text-muted-foreground">
                    Múltiples usuaris treballen simultàniament. Resolució
                    automàtica de conflictes.
                  </p>
                </div>
                <div
                  className="fragment p-6 rounded-xl bg-card border border-border"
                  data-fragment-index="3"
                >
                  <div className="text-4xl mb-4">🔒</div>
                  <h3 className="text-2xl font-semibold mb-3">
                    Propietat de Dades
                  </h3>
                  <p className="text-muted-foreground">
                    L'usuari té control complet sobre les seves dades locals.
                  </p>
                </div>
              </div>
              <div className="fragment text-sm text-muted-foreground text-center mt-8">
                <p>
                  Principis definits per:{" "}
                  <a
                    href="https://www.inkandswitch.com/local-first/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Ink & Switch Research
                  </a>{" "}
                  |{" "}
                  <a
                    href="https://martin.kleppmann.com/papers/local-first.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Article acadèmic (PDF)
                  </a>
                </p>
              </div>
            </div>
          </section>

          <section
            className="flex items-center justify-center"
            data-transition="convex"
          >
            <div className="w-full px-20">
              <h2 className="text-5xl font-bold text-foreground mb-12 text-center">
                Tradicional vs Local-First
              </h2>
              <div className="grid grid-cols-2 gap-12 max-w-6xl mx-auto">
                <div className="space-y-6">
                  <h3 className="text-3xl font-semibold text-center mb-8 text-muted-foreground">
                    Aplicacions Tradicionals
                  </h3>
                  <div className="fragment space-y-4">
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                      <p className="text-lg">
                        ❌ Cada acció requereix servidor
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                      <p className="text-lg">❌ Latència en cada interacció</p>
                    </div>
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                      <p className="text-lg">❌ No funciona sense xarxa</p>
                    </div>
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                      <p className="text-lg">
                        ❌ Conflictes difícils de resoldre
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-3xl font-semibold text-center mb-8 text-primary">
                    Local-First
                  </h3>
                  <div className="fragment space-y-4">
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <p className="text-lg">✅ Execució local immediata</p>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <p className="text-lg">✅ UX instantània sempre</p>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <p className="text-lg">
                        ✅ Funcionalitat completa offline
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <p className="text-lg">✅ Sincronització automàtica</p>
                    </div>
                  </div>
                </div>
              </div>{" "}
              <div className="fragment text-sm text-muted-foreground text-center mt-8">
                <p>
                  <a
                    href="https://electric-sql.com/docs/guides/shapes"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Electric Shapes Documentation
                  </a>{" "}
                  |{" "}
                  <a
                    href="https://www.confluent.io/learn/change-data-capture/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Change Data Capture (CDC)
                  </a>{" "}
                  |{" "}
                  <a
                    href="https://crdt.tech/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    CRDTs
                  </a>
                </p>
              </div>{" "}
            </div>
          </section>

          {/* Architecture Diagrams */}
          <section
            className="flex items-center justify-center"
            data-transition="convex"
          >
            <div className="w-full px-20">
              <h2 className="text-5xl font-bold text-foreground mb-12 text-center">
                Arquitectura: Tradicional (REST)
              </h2>
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col items-center gap-8">
                  {/* Traditional Architecture Diagram - Placeholder */}
                  <div className="w-full h-80 flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/30">
                    <p className="text-2xl text-muted-foreground">
                      [ Diagrama REST Tradicional ]
                    </p>
                  </div>

                  <div className="fragment text-sm text-muted-foreground text-center mt-4">
                    <p>
                      Referència:{" "}
                      <a
                        href="https://www.youtube.com/watch?v=jxuXGeMJsBU"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Johannes Schickling: Why Local-First?
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className="flex items-center justify-center"
            data-transition="concave"
          >
            <div className="w-full px-20">
              <h2 className="text-5xl font-bold text-foreground mb-12 text-center">
                Arquitectura: Local-First
              </h2>
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-col items-center gap-8">
                  {/* Local-First Architecture Diagram - Placeholder */}
                  <div className="w-full h-80 flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/30">
                    <p className="text-2xl text-muted-foreground">
                      [ Diagrama Local-First ]
                    </p>
                  </div>

                  <div className="fragment text-sm text-muted-foreground text-center mt-4">
                    <p>
                      Referència:{" "}
                      <a
                        href="https://electric-sql.com/docs/api/http"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Electric SQL - HTTP API Documentation
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Electric SQL Introduction */}
          <section
            className="flex items-center justify-center"
            data-transition="convex"
          >
            <div className="w-full px-20">
              <h2 className="text-5xl font-bold text-foreground mb-12 text-center">
                Què és Electric SQL?
              </h2>
              <div className="max-w-5xl mx-auto space-y-8">
                <div className="fragment text-center">
                  <p className="text-2xl text-muted-foreground leading-relaxed">
                    Un motor de{" "}
                    <span className="text-primary font-semibold">
                      sincronització en temps real
                    </span>{" "}
                    que conecta Postgres amb el client
                  </p>
                </div>
                <div className="fragment grid grid-cols-3 gap-6 mt-12">
                  <div className="text-center p-6">
                    <div className="text-6xl mb-4">🗄️</div>
                    <h3 className="text-xl font-semibold mb-2">Postgres</h3>
                    <p className="text-muted-foreground text-sm">
                      Font de veritat única
                    </p>
                  </div>
                  <div className="text-center p-6">
                    <div className="text-6xl mb-4">⚡</div>
                    <h3 className="text-xl font-semibold mb-2">Electric</h3>
                    <p className="text-muted-foreground text-sm">
                      Sincronització bidireccional
                    </p>
                  </div>
                  <div className="text-center p-6">
                    <div className="text-6xl mb-4">💻</div>
                    <h3 className="text-xl font-semibold mb-2">Client</h3>
                    <p className="text-muted-foreground text-sm">
                      Base de dades local
                    </p>
                  </div>
                </div>
                <div className="fragment text-sm text-muted-foreground text-center mt-8">
                  <p>
                    Més info:{" "}
                    <a
                      href="https://electric-sql.com/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Electric SQL Documentation
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section
            className="flex items-center justify-center"
            data-transition="concave"
          >
            <div className="w-full px-20">
              <h2 className="text-5xl font-bold text-foreground mb-12 text-center">
                Com Funciona Electric?
              </h2>
              <div className="space-y-8 max-w-5xl mx-auto">
                <div className="fragment fade-up p-8 rounded-xl bg-card border-2 border-border">
                  <div className="flex items-start gap-6">
                    <div className="text-4xl">1️⃣</div>
                    <div>
                      <h3 className="text-2xl font-semibold mb-3">Shapes</h3>
                      <p className="text-muted-foreground text-lg">
                        Defineix quines dades vols sincronitzar del teu
                        Postgres. Pots filtrar per taules, columnes i
                        condicions.
                      </p>
                      <code className="block mt-4 p-4 bg-muted rounded text-sm">
                        {`{ url: '/todos', where: 'user_id = 42' }`}
                      </code>
                    </div>
                  </div>
                </div>
                <div className="fragment fade-up p-8 rounded-xl bg-card border-2 border-border">
                  <div className="flex items-start gap-6">
                    <div className="text-4xl">2️⃣</div>
                    <div>
                      <h3 className="text-2xl font-semibold mb-3">
                        Sincronització Incremental
                      </h3>
                      <p className="text-muted-foreground text-lg">
                        Electric envia només els canvis (deltas) via HTTP
                        streaming. Eficient i ràpid, fins i tot amb moltes
                        dades.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="fragment fade-up p-8 rounded-xl bg-card border-2 border-border">
                  <div className="flex items-start gap-6">
                    <div className="text-4xl">3️⃣</div>
                    <div>
                      <h3 className="text-2xl font-semibold mb-3">
                        Actualitzacions Reactives
                      </h3>
                      <p className="text-muted-foreground text-lg">
                        La UI s'actualitza automàticament quan arriben nous
                        canvis. Tot és reactiu per defecte.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className="flex items-center justify-center"
            data-transition="zoom-in"
          >
            <div className="w-full px-20">
              <h2 className="text-5xl font-bold text-foreground mb-12 text-center">
                Patró d'Arquitectura
              </h2>
              <div className="space-y-8 max-w-5xl mx-auto">
                <div className="fragment fade-up p-8 rounded-xl bg-primary/5 border-2 border-primary/20">
                  <h3 className="text-2xl font-semibold mb-4 text-primary">
                    📖 Lectures: Electric → Client DB
                  </h3>
                  <p className="text-muted-foreground text-lg mb-4">
                    Totes les lectures es fan des de la base de dades local.
                    Zero latència, funciona offline.
                  </p>
                  <code className="block p-4 bg-muted rounded text-sm">
                    {`useLiveQuery((q) => q.from({ todos }).where(...))`}
                  </code>
                </div>
                <div className="fragment fade-up p-8 rounded-xl bg-accent/5 border-2 border-accent/20">
                  <h3 className="text-2xl font-semibold mb-4 text-accent-foreground">
                    ✍️ Escriptures: Client DB → Postgres
                  </h3>
                  <p className="text-muted-foreground text-lg mb-4">
                    Les mutacions s'apliquen localment primer (optimista),
                    després es sincronitzen al servidor en segon pla.
                  </p>
                  <code className="block p-4 bg-muted rounded text-sm">
                    {`collection.insert({ ... }) // Instant UI update`}
                  </code>
                </div>
              </div>
            </div>
          </section>

          <section
            className="flex items-center justify-center"
            data-transition="zoom-out"
          >
            <div className="w-full px-20">
              <h2 className="text-5xl font-bold text-foreground mb-12 text-center">
                Beneficis
              </h2>
              <div className="grid grid-cols-3 gap-6 max-w-6xl mx-auto">
                <div className="fragment p-6 rounded-xl bg-card border border-border text-center">
                  <div className="text-4xl mb-4">🚀</div>
                  <h3 className="text-xl font-semibold mb-2">Millor UX</h3>
                  <p className="text-muted-foreground text-sm">
                    Resposta instantània en totes les interaccions
                  </p>
                </div>
                <div className="fragment p-6 rounded-xl bg-card border border-border text-center">
                  <div className="text-4xl mb-4">💪</div>
                  <h3 className="text-xl font-semibold mb-2">Fiabilitat</h3>
                  <p className="text-muted-foreground text-sm">
                    Funciona sempre, independentment de la connexió
                  </p>
                </div>
                <div className="fragment p-6 rounded-xl bg-card border border-border text-center">
                  <div className="text-4xl mb-4">📉</div>
                  <h3 className="text-xl font-semibold mb-2">Menys Carga</h3>
                  <p className="text-muted-foreground text-sm">
                    Reduces consultes al servidor significativament
                  </p>
                </div>
                <div className="fragment p-6 rounded-xl bg-card border border-border text-center">
                  <div className="text-4xl mb-4">🔄</div>
                  <h3 className="text-xl font-semibold mb-2">Sync Automàtic</h3>
                  <p className="text-muted-foreground text-sm">
                    No cal gestionar caches ni invalidacions
                  </p>
                </div>
                <div className="fragment p-6 rounded-xl bg-card border border-border text-center">
                  <div className="text-4xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold mb-2">Simple</h3>
                  <p className="text-muted-foreground text-sm">
                    Escrius consultes normals, la reactivitat ve de sèrie
                  </p>
                </div>
                <div className="fragment p-6 rounded-xl bg-card border border-border text-center">
                  <div className="text-4xl mb-4">🛡️</div>
                  <h3 className="text-xl font-semibold mb-2">Tipus Segur</h3>
                  <p className="text-muted-foreground text-sm">
                    TypeScript end-to-end amb inferència automàtica
                  </p>
                </div>
              </div>
              <div className="fragment text-sm text-muted-foreground text-center mt-8">
                <p>
                  <a
                    href="https://offlinefirst.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Offline First
                  </a>{" "}
                  |{" "}
                  <a
                    href="https://jepsen.io/consistency"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Consistency Models - Jepsen
                  </a>
                </p>
              </div>
            </div>
          </section>

          <section
            className="flex items-center justify-center"
            data-transition="fade"
          >
            <div className="w-full px-20">
              <h2 className="text-5xl font-bold text-foreground mb-12 text-center">
                Casos d'Ús Ideals
              </h2>
              <div className="grid grid-cols-2 gap-8 max-w-5xl mx-auto">
                <div className="fragment p-8 rounded-xl bg-card border border-border">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="text-2xl font-semibold mb-3">
                    Apps Col·laboratives
                  </h3>
                  <p className="text-muted-foreground">
                    Editors de documents, gestió de projectes, CRMs
                  </p>
                </div>
                <div className="fragment p-8 rounded-xl bg-card border border-border">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-2xl font-semibold mb-3">Dashboards</h3>
                  <p className="text-muted-foreground">
                    Visualitzacions de dades en temps real, analítiques
                  </p>
                </div>
                <div className="fragment p-8 rounded-xl bg-card border border-border">
                  <div className="text-4xl mb-4">🎮</div>
                  <h3 className="text-2xl font-semibold mb-3">
                    Apps Multiplayer
                  </h3>
                  <p className="text-muted-foreground">
                    Jocs, xats, aplicacions socials en temps real
                  </p>
                </div>
                <div className="fragment p-8 rounded-xl bg-card border border-border">
                  <div className="text-4xl mb-4">📱</div>
                  <h3 className="text-2xl font-semibold mb-3">Apps Mòbils</h3>
                  <p className="text-muted-foreground">
                    Qualsevol app que necessiti funcionar offline
                  </p>
                </div>
              </div>
              <div className="fragment text-sm text-muted-foreground text-center mt-8">
                <p>
                  Exemples reals:{" "}
                  <a
                    href="https://linear.app/method/offline-first"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Linear
                  </a>{" "}
                  |{" "}
                  <a
                    href="https://www.figma.com/blog/how-figmas-multiplayer-technology-works/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Figma
                  </a>{" "}
                  |{" "}
                  <a
                    href="https://www.notion.so/help/offline-mode"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Notion
                  </a>
                </p>
              </div>
            </div>
          </section>

          <section
            className="flex items-center justify-center"
            data-transition="zoom"
          >
            <div className="text-center space-y-8">
              <h2 className="text-6xl font-bold text-foreground">Gràcies!</h2>
              <p className="text-2xl text-muted-foreground">
                Preguntes sobre local-first o Electric SQL?
              </p>
              <div className="mt-12 flex gap-4 justify-center">
                <a
                  href="https://electric-sql.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-lg font-medium"
                >
                  electric-sql.com
                </a>
                <a
                  href="/"
                  className="px-6 py-3 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors text-lg font-medium"
                >
                  Veure Demo
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
