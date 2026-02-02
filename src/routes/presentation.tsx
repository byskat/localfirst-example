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
      maxScale: 2,
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
              <p className="text-2xl text-muted-foreground">
                Una introducció a Electric SQL i sincronització en temps real
              </p>
              <p className="text-lg text-muted-foreground/70">
                Víctor A. Serrano | Febrer 2026
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
                    <span className="text-foreground/40">Pot </span>Funciona
                    <span className="text-foreground/40">r </span>
                    Offline
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
                    Col·laboració en temps Real
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
                    Dades Sempre Disponibles
                  </h3>
                  <p className="text-muted-foreground">
                    Les dades persisteixen localment.
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
                      <p className="text-lg font-semibold mb-2">
                        ❌ Concatenació de Peticions
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Carregar vista: users → projects → todos (seqüencial)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Waterfalls de queries, temps acumulatiu
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                      <p className="text-lg font-semibold mb-2">
                        ❌ Mutacions Lentes
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Clic → espera → spinner → resposta servidor
                      </p>
                      <p className="text-sm text-muted-foreground">
                        200-1000ms per cada acció de l'usuari
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                      <p className="text-lg font-semibold mb-2">
                        ❌ Sense Xarxa = App Trencada
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Cal spinners, skeletons, error states
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
                      <p className="text-lg font-semibold mb-2">
                        ❌ Conflictes Manuals
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Race conditions, locks, última escriptura guanya
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
                      <p className="text-lg font-semibold mb-2">
                        ✅ Latència <span className="text-xs">casi</span> Zero
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Usuari clica → Update local DB → UI (instant)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        &lt;5ms per acció
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <p className="text-lg font-semibold mb-2">
                        ✅ Actualitzacions Optimistes
                      </p>
                      <p className="text-sm text-muted-foreground">
                        UI canvia primer, sync en segon pla
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Si error: rollback automàtic + notificació
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <p className="text-lg font-semibold mb-2">
                        ✅ Funciona Offline
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Els canvis s'encuen, sync quan torna connexió
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <p className="text-lg font-semibold mb-2">
                        ✅ Resolució Automàtica
                      </p>
                      <p className="text-sm text-muted-foreground">
                        CRDTs o sync engine gestiona conflictes
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="fragment text-center mt-8">
                <p className="text-xl text-primary font-semibold mb-2">
                  "Make the common case fast"
                </p>
                <p className="text-sm text-muted-foreground">— Algun friki</p>
              </div>
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
                  <div className="w-full h-80 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/30 p-8">
                    <p className="text-2xl text-muted-foreground mb-4">
                      [ Diagrama REST Tradicional ]
                    </p>
                    <code className="text-sm text-center">
                      [Navegador] ←→ [Servidor API] ←→ [Base de Dades]
                      <br />
                      &nbsp;&nbsp;&nbsp;HTTP&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;HTTP&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;SQL
                    </code>
                  </div>

                  <div className="fragment grid grid-cols-2 gap-6 w-full mt-4">
                    <div className="p-4 rounded-lg bg-card border border-border">
                      <p className="text-sm font-semibold mb-2">
                        📤 Client fa peticions discretes
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cada query/mutation = nova petició HTTP
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-card border border-border">
                      <p className="text-sm font-semibold mb-2">
                        🚪 Servidor com a guardian
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Controla accés, executa lògica, retorna dades
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-card border border-border">
                      <p className="text-sm font-semibold mb-2">
                        🗄️ DB oculta darrere API
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Client no té visibilitat directa de les dades
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-card border border-border">
                      <p className="text-sm font-semibold mb-2">
                        🔄 Polling per actualitzacions
                      </p>
                      <p className="text-xs text-muted-foreground">
                        O WebSockets per temps real
                      </p>
                    </div>
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
                  <div className="w-full h-80 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/30 p-8">
                    <p className="text-2xl text-muted-foreground mb-4">
                      [ Diagrama Local-First ]
                    </p>
                    <code className="text-sm text-center">
                      [Client/DB Local] ←→ [Motor Sync] ←→ [Postgres]
                      <br />
                      &nbsp;&nbsp;&nbsp;(Memòria/IndexedDB/...)&nbsp;&nbsp;(Electric)&nbsp;&nbsp;&nbsp;(Font
                      Veritat)
                      <br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↕&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;↕
                      <br />
                      &nbsp;&nbsp;Consultes&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;HTTP
                      Streaming
                      <br />
                      &nbsp;&nbsp;Mutacions&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ Long
                      Polling
                    </code>
                  </div>

                  <div className="fragment grid grid-cols-3 gap-4 w-full mt-4">
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <p className="text-sm font-semibold mb-2">
                        💾 Queries Locals
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Lectures des de store local, zero latència
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <p className="text-sm font-semibold mb-2">
                        👁️ Dades Visibles
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Client té accés directe a DB local completa
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <p className="text-sm font-semibold mb-2">
                        ⚡ Sync Automàtic
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Electric detecta canvis a Postgres i fa push als clients
                      </p>
                    </div>
                    <div className="col-span-3 p-4 rounded-lg bg-primary/10 border border-primary/30">
                      <p className="text-sm font-semibold mb-2">
                        🛡️ Auth al Servidor: Filtratge en Origen
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Proxy autentica usuari, afegeix{" "}
                        <code className="bg-muted px-1 rounded">{`WHERE user_id = '$\{session.user.id}'`}</code>{" "}
                        al shape. Electric aplica filtre{" "}
                        <strong>abans de sincronitzar</strong> - el client mai
                        rep dades d'altres usuaris.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CRDTs & Conflict Resolution */}
          <section
            className="flex items-center justify-center"
            data-transition="zoom-in"
          >
            <div className="w-full px-20">
              <h2 className="text-5xl font-bold text-foreground mb-12 text-center">
                CRDTs i Resolució de Conflictes
              </h2>
              <div className="max-w-5xl mx-auto space-y-8">
                <div
                  className="fragment p-6 rounded-xl bg-card border-2 border-destructive/30"
                  data-fragment-index="0"
                >
                  <h3 className="text-2xl font-semibold mb-4 text-destructive">
                    El Problema
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-destructive/10 rounded">
                      <p className="font-semibold mb-2">
                        👤 Usuari A (offline)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Marca tasca com completada
                      </p>
                    </div>
                    <div className="p-4 bg-destructive/10 rounded">
                      <p className="font-semibold mb-2">
                        👤 Usuari B (offline)
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Elimina la mateixa tasca
                      </p>
                    </div>
                  </div>
                  <p className="text-center mt-4 text-xl">
                    Tots dos es reconnecten → Què passa? 🤔
                  </p>
                </div>

                <div className="relative min-h-[280px]">
                  <div
                    className="fragment fade-out absolute inset-0"
                    data-fragment-index="2"
                  >
                    <div
                      className="fragment p-6 rounded-xl bg-card border-2 border-border"
                      data-fragment-index="1"
                    >
                      <h3 className="text-2xl font-semibold mb-4">
                        Solució Tradicional (REST)
                      </h3>
                      <div className="space-y-3">
                        <div className="p-4 bg-muted rounded">
                          <p className="font-semibold mb-2">
                            🔄 Optimistic Locking
                          </p>
                          <p className="text-sm text-muted-foreground">
                            El servidor rebutja canvis si la versió no
                            coincideix → L'usuari veu error i ha de resoldre
                            manualment
                          </p>
                        </div>
                        <div className="p-4 bg-muted rounded">
                          <p className="font-semibold mb-2">
                            🕐 Last Write Wins
                          </p>
                          <p className="text-sm text-muted-foreground">
                            El canvi més recent sobreescriu l'anterior → Es perd
                            el treball d'un dels usuaris
                          </p>
                        </div>
                        <div className="p-4 bg-muted rounded">
                          <p className="font-semibold mb-2">⚠️ Merge Manual</p>
                          <p className="text-sm text-muted-foreground">
                            El servidor detecta conflicte → Requereix lògica
                            customitzada per cada cas
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="fragment fade-in absolute inset-0"
                    data-fragment-index="2"
                  >
                    <div className="p-6 rounded-xl bg-primary/5 border-2 border-primary/30">
                      <h3 className="text-2xl font-semibold mb-4 text-primary">
                        Solució ElectricSQL: Transaction IDs
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Tots els canvis s'ordenen per{" "}
                        <code className="bg-muted px-1 rounded">txid</code>{" "}
                        generat pel Postgres. Ordre garantit globalment per
                        convergència automàtica.
                      </p>
                      <code className="block p-3 bg-muted rounded text-xs whitespace-pre">
                        {`// Usuari A marca completat (offline)
todoCollection.update(todoId, (draft) => {
  draft.completed = true  // txid: "12345" quan sincronitza
})

// Usuari B elimina (offline)
todoCollection.delete(todoId)  // txid: "12346" quan sincronitza

// Reconnexió: Electric aplica canvis en ordre de txid
// → txid:12345: update completed=true
// → txid:12346: delete
// Resultat final: tasca eliminada (últim txid guanya)
// TOTS els clients arriben al mateix estat`}
                      </code>
                    </div>
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
                Shapes: El Concepte Central
              </h2>
              <div className="space-y-6 max-w-5xl mx-auto">
                <div
                  className="fragment p-6 rounded-xl bg-card border-2 border-border"
                  data-fragment-index="0"
                >
                  <h3 className="text-2xl font-semibold mb-4">
                    Què és un Shape?
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Un <strong>shape</strong> és una "subscripció" a un
                    subconjunt de dades de Postgres. El shape defineix{" "}
                    <em>quines dades</em> sincronitzar al client.
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="p-3 bg-primary/10 rounded text-center">
                      <div className="text-2xl mb-1">📊</div>
                      <p className="text-xs font-semibold">Taules</p>
                      <p className="text-xs text-muted-foreground">
                        Quines taules
                      </p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded text-center">
                      <div className="text-2xl mb-1">🔍</div>
                      <p className="text-xs font-semibold">Filtres WHERE</p>
                      <p className="text-xs text-muted-foreground">
                        Quines files
                      </p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded text-center">
                      <div className="text-2xl mb-1">📝</div>
                      <p className="text-xs font-semibold">Columnes</p>
                      <p className="text-xs text-muted-foreground">
                        Quins camps
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    El servidor controla l'accés: cada usuari només rep les
                    dades que està autoritzat a veure.
                  </p>
                </div>

                <div
                  className="fragment grid grid-cols-2 gap-6"
                  data-fragment-index="1"
                >
                  <div className="p-5 rounded-xl bg-accent/5 border border-accent/30">
                    <h4 className="text-lg font-semibold mb-3">
                      Definint un Shape
                    </h4>
                    <code className="block p-3 bg-muted rounded text-xs whitespace-pre">
                      {`const todosCollection = createCollection(
  electricCollectionOptions({
    id: 'todos',
    shapeOptions: {
      url: '/api/todos'
    },
    schema: selectTodosSchema,
    getKey: (item) => item.id,

    // Handlers per mutacions
    onInsert: async ({ transaction }) => {
      // Envia al servidor via tRPC
      const result = await trpc.todos.create.mutate(...)
      return { txid: result.txid }
    }
  })
)`}
                    </code>
                  </div>

                  <div className="p-5 rounded-xl bg-accent/5 border border-accent/30">
                    <h4 className="text-lg font-semibold mb-3">Com Funciona</h4>
                    <ol className="space-y-2 text-xs leading-relaxed">
                      <li>
                        <strong>1. Sync inicial:</strong> Client demana shape{" "}
                        <code className="bg-muted px-1 rounded">
                          GET /api/todos
                        </code>
                      </li>
                      <li>
                        <strong>2. Dades inicials:</strong> Electric consulta
                        Postgres i retorna totes les files
                      </li>
                      <li>
                        <strong>3. Persistència:</strong> Client guarda a
                        IndexedDB/memòria local
                      </li>
                      <li>
                        <strong>4. Long-polling:</strong> Client manté connexió
                        oberta per canvis
                      </li>
                      <li>
                        <strong>5. CDC streaming:</strong> Electric detecta
                        canvis a Postgres (INSERT/UPDATE/DELETE)
                      </li>
                      <li>
                        <strong>6. Sync incremental:</strong> Només els{" "}
                        <em>canvis</em> es sincronitzen
                      </li>
                      <li>
                        <strong>7. Actualització reactiva:</strong> UI es
                        re-renderitza automàticament
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className="flex items-center justify-center"
            data-transition="convex"
          >
            <div className="w-full px-20">
              <h2 className="text-5xl font-bold text-foreground mb-12 text-center">
                Shapes: El Concepte Central 2{" "}
                <span className="text-xs">electric boogaloo</span>
              </h2>
              <div className="max-w-5xl mx-auto relative min-h-[400px]">
                <div
                  className="fragment fade-out absolute inset-0 space-y-6"
                  data-fragment-index="2"
                >
                  <div
                    className="fragment p-6 rounded-xl bg-primary/5 border-2 border-primary/30"
                    data-fragment-index="0"
                  >
                    <h3 className="text-2xl font-semibold mb-4 text-primary">
                      ✅ Casos d'Ús Ideals
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-primary/10 rounded">
                        <p className="font-semibold mb-2">📊 Metadades</p>
                        <p className="text-sm text-muted-foreground">
                          Configuració de dashboards, charts, definicions de
                          sèries
                        </p>
                      </div>
                      <div className="p-4 bg-primary/10 rounded">
                        <p className="font-semibold mb-2">
                          📝 Dades d'Aplicació
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Tasques, projectes, usuaris, configuració
                        </p>
                      </div>
                      <div className="p-4 bg-primary/10 rounded">
                        <p className="font-semibold mb-2">
                          💬 Dades Col·laboratives
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Comments, assignacions, estats de treball
                        </p>
                      </div>
                      <div className="p-4 bg-primary/10 rounded">
                        <p className="font-semibold mb-2">🎨 UI State</p>
                        <p className="text-sm text-muted-foreground">
                          Preferències d'usuari, layouts, vistes guardades
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className="fragment p-6 rounded-xl bg-destructive/5 border-2 border-destructive/30"
                    data-fragment-index="1"
                  >
                    <h3 className="text-2xl font-semibold mb-4 text-destructive">
                      ❌ Evitar per a Aquestes Dades
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-destructive/10 rounded">
                        <p className="font-semibold mb-2">📈 Time Series</p>
                        <p className="text-sm text-muted-foreground">
                          Milers de punts de dades per segon (mètriques, logs)
                        </p>
                      </div>
                      <div className="p-4 bg-destructive/10 rounded">
                        <p className="font-semibold mb-2">💾 Volums Massius</p>
                        <p className="text-sm text-muted-foreground">
                          Milions de files per sincronitzar al client
                        </p>
                      </div>
                      <div className="p-4 bg-destructive/10 rounded">
                        <p className="font-semibold mb-2">📹 Fitxers Grans</p>
                        <p className="text-sm text-muted-foreground">
                          Vídeos, imatges d'alta resolució (usar blob storage)
                        </p>
                      </div>
                      <div className="p-4 bg-destructive/10 rounded">
                        <p className="font-semibold mb-2">
                          🔐 Dades Sensibles Globals
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Informació que NO pertany al client (filtrar amb
                          WHERE)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="fragment fade-in absolute inset-0"
                  data-fragment-index="2"
                >
                  <div className="p-6 rounded-xl bg-accent/5 border-2 border-accent/30">
                    <h3 className="text-2xl font-semibold mb-4">
                      Sync l'estat, query els data points
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Electric és perfecte per sincronitzar{" "}
                      <strong>metadades i estat d'aplicació</strong>. Per grans
                      volums de dades o amb alta freqüència, s'han de peticionar
                      sota demanda (REST, tRPC, streams).
                    </p>
                    <div className="p-5 bg-muted rounded">
                      <p className="text-lg font-semibold mb-3">
                        Exemple: Dashboard
                      </p>
                      <ul className="text-sm space-y-2 text-muted-foreground">
                        <li>
                          ✅ Sync via Electric: Definició del dashboard, charts,
                          filtres, usuaris
                        </li>
                        <li>
                          ❌ NO sync: Els 10M data points de cada sèrie temporal
                        </li>
                        <li>
                          ✅ Query via tRPC: Carregar només el rang de dates
                          visible
                        </li>
                      </ul>
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
                Flux de Dades: Lectures i Escriptures
              </h2>
              <div className="max-w-6xl mx-auto">
                <div
                  className="fragment grid grid-cols-2 gap-6 mb-6"
                  data-fragment-index="0"
                >
                  <div className="p-5 rounded-xl bg-primary/5 border-2 border-primary/20">
                    <h3 className="text-xl font-semibold mb-3 text-primary">
                      📖 Lectures: Electric → Local
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      Totes les lectures des del store local. Zero latència,
                      funciona offline.
                    </p>
                    <code className="block p-3 bg-muted rounded text-xs whitespace-pre">
                      {`// Precarrega col·lecció en route loader
export const Route = createFileRoute('/todos/')({
  loader: () => todosCollection.preload()
})

// Query reactiva: s'actualitza automàticament
const { data: todos } = useLiveQuery((q) =>
  q.from({ todosCollection })
   .where(({ todo }) => eq(todo.completed, false))
)`}
                    </code>
                  </div>

                  <div className="p-5 rounded-xl bg-accent/5 border-2 border-accent/20">
                    <h3 className="text-xl font-semibold mb-3 text-accent-foreground">
                      ✍️ Escriptures: Local → tRPC
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      Mutacions locals primer (optimista), sync al servidor en
                      segon pla.
                    </p>
                    <code className="block p-3 bg-muted rounded text-xs whitespace-pre">
                      {`// Update local immediat (optimista)
todoCollection.update(todoId, (draft) => {
  draft.completed = true
})

// En segon pla: sync amb servidor
onUpdate: async ({ transaction }) => {
  const result = await trpc.todos.update.mutate(...)
  return { txid: result.txid }
}`}
                    </code>
                  </div>
                </div>

                <div
                  className="fragment p-5 rounded-xl bg-card border border-border"
                  data-fragment-index="1"
                >
                  <h4 className="text-lg font-semibold mb-3">
                    📊 Flux Complet d'una Mutació
                  </h4>
                  <ol className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    <li className="flex items-start">
                      <span className="font-semibold text-primary mr-2">
                        1.
                      </span>
                      <span className="text-muted-foreground">
                        Update local immediat → UI canvia
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold text-primary mr-2">
                        2.
                      </span>
                      <span className="text-muted-foreground">
                        tRPC mutation en segon pla
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold text-primary mr-2">
                        3.
                      </span>
                      <span className="text-muted-foreground">
                        Postgres rep canvi, retorna txid
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold text-primary mr-2">
                        4.
                      </span>
                      <span className="text-muted-foreground">
                        Electric detecta canvi via CDC
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold text-primary mr-2">
                        5.
                      </span>
                      <span className="text-muted-foreground">
                        Broadcast a tots els altres clients
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold text-primary mr-2">
                        6.
                      </span>
                      <span className="text-muted-foreground">
                        Reconciliació amb txid local
                      </span>
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          {/* Benefits and Challenges */}
          <section
            className="flex items-center justify-center"
            data-transition="zoom-out"
          >
            <div className="w-full px-20">
              <h2 className="text-5xl font-bold text-foreground mb-12 text-center">
                Beneficis i Reptes
              </h2>
              <div className="grid grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Benefits */}
                <div className="space-y-4">
                  <h3 className="text-3xl font-semibold text-primary mb-6">
                    ✅ Beneficis
                  </h3>
                  <div
                    className="fragment p-4 rounded-xl bg-primary/10 border border-primary/30"
                    data-fragment-index="0"
                  >
                    <p className="font-semibold mb-1">🚀 Millor UX</p>
                    <p className="text-sm text-muted-foreground">
                      Interaccions instantànies, "feeling" d'aplicació nativa
                    </p>
                  </div>
                  <div
                    className="fragment p-4 rounded-xl bg-primary/10 border border-primary/30"
                    data-fragment-index="0"
                  >
                    <p className="font-semibold mb-1">📱 Suport Offline</p>
                    <p className="text-sm text-muted-foreground">
                      Funcionalitat bàsica sense internet
                    </p>
                  </div>
                  <div
                    className="fragment p-4 rounded-xl bg-primary/10 border border-primary/30"
                    data-fragment-index="0"
                  >
                    <p className="font-semibold mb-1">
                      📉 Càrrega reduïda del servidor
                    </p>
                    <p className="text-sm text-muted-foreground">
                      La majoria de lectures passen al client
                    </p>
                  </div>
                  <div
                    className="fragment p-4 rounded-xl bg-primary/10 border border-primary/30"
                    data-fragment-index="0"
                  >
                    <p className="font-semibold mb-1">
                      🔄 Col·laboració en temps real
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Per defecte, no afegida posteriorment
                    </p>
                  </div>
                  <div
                    className="fragment p-4 rounded-xl bg-primary/10 border border-primary/30"
                    data-fragment-index="0"
                  >
                    <p className="font-semibold mb-1">🛡️ Type Safety</p>
                    <p className="text-sm text-muted-foreground">
                      TypeScript end-to-end des de DB a UI
                    </p>
                  </div>
                </div>

                {/* Challenges */}
                <div className="space-y-4">
                  <h3 className="text-3xl font-semibold text-amber-500 mb-6">
                    ⚠️ Reptes
                  </h3>
                  <div
                    className="fragment p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
                    data-fragment-index="1"
                  >
                    <p className="font-semibold mb-1">🧠 Canvi de paradigma</p>
                    <p className="text-sm text-muted-foreground">
                      Més lògica al client, cal entendre sistemes distribuïts
                    </p>
                  </div>
                  <div
                    className="fragment p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
                    data-fragment-index="1"
                  >
                    <p className="font-semibold mb-1">
                      💾 Consideracions d'emmagatzematge
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Cal dissenyar shapes per no sincronitzar dades
                      innecessàries al client
                    </p>
                  </div>
                  <div
                    className="fragment p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
                    data-fragment-index="1"
                  >
                    <p className="font-semibold mb-1">⏱️ Càrrega inicial</p>
                    <p className="text-sm text-muted-foreground">
                      Primera visita: descarrega shape. Solució: lazy loading
                    </p>
                  </div>
                  <div
                    className="fragment p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
                    data-fragment-index="1"
                  >
                    <p className="font-semibold mb-1">
                      🔧 Debug de l'estat client
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Els clients estan sincronitzats amb la DB?
                    </p>
                  </div>
                  <div
                    className="fragment p-4 rounded-xl bg-amber-500/10 border border-amber-500/30"
                    data-fragment-index="1"
                  >
                    <p className="font-semibold mb-1">🆕 Arquitectura "nova"</p>
                    <p className="text-sm text-muted-foreground">
                      Patró relativament nou, menys recursos i comunitat que
                      REST/GraphQL
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            className="flex items-center justify-center"
            data-transition="fade"
          >
            <div className="w-full px-20">
              <h2 className="text-5xl font-bold text-foreground mb-12 text-center">
                Exemples Reals de Local-First
              </h2>
              <div className="grid grid-cols-3 gap-8 max-w-6xl mx-auto">
                <div className="fragment p-8 rounded-xl bg-card border border-border">
                  <div className="text-5xl mb-4">📐</div>
                  <h3 className="text-2xl font-semibold mb-3">Linear</h3>
                  <p className="text-muted-foreground mb-4">
                    Gestió de projectes amb sync instantani. Latència &lt;50ms
                    per totes les accions.
                  </p>
                  <a
                    href="https://linear.app/now/scaling-the-linear-sync-engine"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Llegir sobre la seva arquitectura →
                  </a>
                </div>
                <div className="fragment p-8 rounded-xl bg-card border border-border">
                  <div className="text-5xl mb-4">🎨</div>
                  <h3 className="text-2xl font-semibold mb-3">Figma</h3>
                  <p className="text-muted-foreground mb-4">
                    Col·laboració en temps real per disseny. CRDTs per resolució
                    de conflictes.
                  </p>
                  <a
                    href="https://www.figma.com/blog/how-figmas-multiplayer-technology-works/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Com funciona multiplayer →
                  </a>
                </div>
                <div className="fragment p-8 rounded-xl bg-card border border-border">
                  <div className="text-5xl mb-4">📝</div>
                  <h3 className="text-2xl font-semibold mb-3">Notion</h3>
                  <p className="text-muted-foreground mb-4">
                    Editor de documents offline-first. Sync automàtic quan es
                    reconnecta.
                  </p>
                  <a
                    href="https://www.notion.com/blog/how-we-made-notion-available-offline"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    Documentació offline mode →
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Resources & Conclusion */}
          <section
            className="flex items-center justify-center"
            data-transition="fade"
          >
            <div className="w-full px-20">
              <h2 className="text-5xl font-bold text-foreground mb-12 text-center">
                Recursos i Aprenentatge
              </h2>
              <div className="max-w-5xl mx-auto space-y-6">
                <div className="fragment grid grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="text-xl font-semibold mb-3">
                      📚 Fonaments Teòrics
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a
                          href="https://www.inkandswitch.com/local-first/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Ink & Switch - Local-First Software
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://martin.kleppmann.com/papers/local-first.pdf"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Article Acadèmic (PDF)
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://crdt.tech/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          CRDTs Explained
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="text-xl font-semibold mb-3">
                      ⚡ Electric SQL
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a
                          href="https://electric-sql.com/docs"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Documentació Oficial
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://electric-sql.com/docs/guides/shapes"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Shapes Guide
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://electric-sql.com/docs/guides/auth"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Authentication Patterns
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="text-xl font-semibold mb-3">
                      🎯 TanStack DB
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a
                          href="https://tanstack.com/db"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          TanStack DB Docs
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://frontendatscale.com/blog/tanstack-db/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Interactive Guide (Frontend at Scale)
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://tanstack.com/blog/tanstack-db-0.1-the-embedded-client-database-for-tanstack-query"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Launch Blog Post
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div className="p-6 rounded-xl bg-card border border-border">
                    <h3 className="text-xl font-semibold mb-3">
                      🏢 Exemples Reals
                    </h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a
                          href="https://linear.app/method/offline-first"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Linear - Offline-First Architecture
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.figma.com/blog/how-figmas-multiplayer-technology-works/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Figma - Multiplayer Technology
                        </a>
                      </li>
                      <li>
                        <a
                          href="https://www.youtube.com/watch?v=jxuXGeMJsBU"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          Johannes Schickling - Why Local-First?
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="fragment p-8 rounded-xl bg-primary/5 border-2 border-primary/30 text-center">
                  <h3 className="text-2xl font-semibold mb-4">
                    🎯 Conclusions
                  </h3>
                  <ol className="space-y-3 text-left max-w-3xl mx-auto">
                    <li className="text-lg">
                      <span className="font-semibold text-primary">1.</span>{" "}
                      Local-first = dades al dispositiu, sync en segon pla
                    </li>
                    <li className="text-lg">
                      <span className="font-semibold text-primary">2.</span> UX
                      ràpida amb menys complexitat
                    </li>
                    <li className="text-lg">
                      <span className="font-semibold text-primary">3.</span>{" "}
                      ElectricSQL ho fa pràctic amb Postgres
                    </li>
                    <li className="text-lg">
                      <span className="font-semibold text-primary">4.</span>{" "}
                      Provat a escala per Linear, Figma i Notion
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </section>

          <section
            className="flex items-center justify-center"
            data-transition="zoom"
          >
            <div className="text-center space-y-8">
              <h2 className="text-6xl font-bold text-foreground">Pos ia tah</h2>
              <p className="text-2xl text-muted-foreground">Preguntes?</p>
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
