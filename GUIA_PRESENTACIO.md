# Presentació: Arquitectura Local-First

---

## Taula de Continguts
1. [Estructura de la Presentació](#estructura-de-la-presentació)
2. [Part I: Fonamentació Teòrica (8-10 minuts)](#part-i-fonamentació-teòrica)
3. [Part II: ElectricSQL en la Pràctica (8-10 minuts)](#part-ii-electricsql-en-la-pràctica)
4. [Declaracions Finals (2 minuts)](#declaracions-finals)
5. [FAQ](#faq)

---

## Estructura de la Presentació

### Distribució del Temps
- **Introducció**: 1 minut
- **Part I - Teoria**: 8-10 minuts (5 diapositives)
- **Part II - ElectricSQL**: 8-10 minuts (4-5 diapositives)
- **Exemples Reals**: 1-2 minuts (1 diapositiva)
- **Tancament**: 2 minuts (2 diapositives)
- **Marge per preguntes**: Durant tota la presentació

---

## Part I: Fonamentació Teòrica
*Objectiu: Explicar què significa local-first, per què importa, i els conceptes subjacents*

### Diapositiva 1: Portada (30 segons)
**Contingut**: "Arquitectura Local-First: Construint aplicacions que funcionen en qualsevol lloc"

- Benvinguda i context: Estem explorant un canvi de paradigma en com construïm aplicacions web
- Es tracta de posar el dispositiu de l'usuari en primer lloc, no el servidor
- Breu menció: Cobrirem teoria primer, després ens endinsarem en una implementació pràctica amb ElectricSQL

**Punts Clau**:
- Local-first no és només "offline-first" - és un canvi arquitectònic fonamental
- Inspirat per experiències d'aplicacions natives, però per a la web

---

### Diapositiva 2: Què és Local-First? (2 minuts)
**Contingut**: 4 principis bàsics amb icones


**⚡ Resposta Instantània**:
- Apps tradicionals: Cada clic = petició de xarxa = temps d'espera
- Local-first: Les dades viuen al dispositiu en IndexedDB/SQLite
- Les operacions succeeixen instantàniament perquè llegeixes/escrius localment
- Com utilitzar una app nativa d'iOS/Android vs un formulari web

**📱 Funciona Offline**:
- L'aplicació continua funcionant sense internet
- Els canvis s'encuen i es sincronitzen quan torna la connexió
- Crític per usuaris mòbils, xarxes poc fiables, escenaris de viatge
- Exemple: Imagina editar un Google Doc en un avió - això és local-first

**👥 Col·laboració Real**:
- Múltiples usuaris poden treballar simultàniament sobre les mateixes dades
- Els conflictes es resolen automàticament usant CRDTs o transformacions operacionals
- No més "aquest document està bloquejat per un altre usuari"
- Pensa en: Figma, Google Docs, Linear

**🔒 Propietat de les Dades**:
- Les dades de l'usuari romanen primer al seu dispositiu
- Tenen control sobre les seves dades fins i tot si el servidor cau
- Beneficis de privacitat: dades sensibles poden romandre locals
- Es relaciona amb GDPR, preocupacions de sobirania de dades

**Referències a Mencionar**:
- Article de recerca d'Ink & Switch (2019) - va definir aquests principis
- Martin Kleppmann (investigador de sistemes distribuïts) - fonamentació acadèmica
- Això no és teoria nova - Linear, Figma, Notion ja ho fan

---

### Diapositiva 3: Tradicional vs Local-First (2-3 minuts)
**Contingut**: Comparació costat a costat


**Tradicional (Cascada de Peticions)**:
```
Usuari clica → Petició HTTP → Servidor processa → Consulta DB →
Resposta → Actualitza UI
```
- Cada acció requereix anada i tornada al servidor (200-500ms mínim)
- La latència de xarxa es composa:
  - Usuari a Barcelona, servidor als EUA = 150ms
  - 4G mòbil = pot pujar a 1000ms+
  - Afegeix temps de consulta a base de dades (50-100ms)
- Sense xarxa = app trencada
- Condicions de carrera entre múltiples usuaris editant
- Complexitat de gestió d'estat (estats de càrrega, estats d'error, dades obsoletes)

**Patró Local-First**:
```
Usuari clica → Actualitza DB local → Actualitza UI (instantani) →
En segon pla: Sync al servidor → Broadcast a altres clients
```
- Latència zero per lectures i escriptures
- Actualitzacions optimistes: la UI canvia immediatament, el sync passa en segon pla
- Funciona offline: els canvis s'encuen, sincronitzen quan es reconnecta
- Resolució automàtica de conflictes via motor de sync
- Consistència eventual: tots els clients convergeixen al mateix estat

**Implicacions UI/UX**:
- **Tradicional**: Necessita spinners de càrrega, pantalles esquelet, botons de reintent d'error
- **Local-first**: Sense estats de càrrega (dades ja locals), feedback instant, indicadors de progrés només per sync en segon pla
- Els usuaris perceben l'app com a "més ràpida" fins i tot amb la mateixa latència de backend

**Frase Clau**: "Fes el cas comú instant, gestiona el cas extrem amb elegància"

---

### Diapositiva 4: Com Funciona - Motors de Sync (2-3 minuts)
**Contingut**: Diagrames de comparació d'arquitectura


**Arquitectura REST Tradicional**:
```
[Navegador] ←→ [Servidor API] ←→ [Base de Dades]
   HTTP            HTTP              SQL
```
- El client fa peticions discretes
- El servidor actua com a guardian
- La base de dades està oculta darrere l'API
- Polling o WebSockets per actualitzacions en temps real

**Arquitectura Local-First**:
```
[Navegador/IndexedDB] ←→ [Motor de Sync] ←→ [Postgres]
   (DB Local)               (Electric)        (Font de Veritat)
      ↕                         ↕
   Consultes            HTTP Streaming
   Mutacions           + Long Polling
                       + WebSocket
```

**Rol del Motor de Sync** (ElectricSQL en el nostre cas):
- Se situa entre client i base de dades
- Utilitza Change Data Capture (CDC) per observar canvis a la base de dades
- Fa streaming només dels canvis (deltas) als clients via HTTP
- Bidireccional: els canvis del client van a la DB, els canvis de la DB van a tots els clients

**Change Data Capture (CDC)**:
- Característica de PostgreSQL (via replicació lògica)
- Crea un stream de tots els canvis a la base de dades
- Electric se subscriu a aquest stream
- Transforma els canvis de la DB en format amigable per al client
- Overhead mínim a la base de dades

**Per què no GraphQL/REST?**:
- GraphQL encara requereix anades i tornades per petició
- REST necessita polling manual per actualitzacions
- Cap dels dos gestiona bé escenaris offline
- Els motors de sync estan dissenyats específicament per sync de dades bidireccional i en temps real

---

### Diapositiva 5: CRDTs i Resolució de Conflictes (2 minuts)
**Contingut**: Diapositiva de conceptes tècnics


**El Problema**:
- Usuari A offline: marca tasca com a completada
- Usuari B offline: elimina la mateixa tasca
- Tots dos es reconnecten - què passa?

**Solució 1: Última Escriptura Guanya (LWW - Last Write Wins)**:
- Simple: el timestamp més recent guanya
- Problema: pot perdre dades
- Utilitzat en: apps simples, dades no crítiques

**Solució 2: CRDTs (Conflict-free Replicated Data Types)**:
- Garantia matemàtica: totes les rèpliques convergeixen al mateix estat
- Les operacions són commutatives: A + B + C = C + B + A
- Tipus:
  - **G-Counter**: Comptador només creixent (com likes)
  - **PN-Counter**: Comptador Positiu-Negatiu (pot decrementar)
  - **LWW-Register**: Última-escriptura-guanya per valors individuals
  - **OR-Set**: Afegir/eliminar elements d'un conjunt
  - **RGA**: Array de Creixement Replicat (edició de text)

**En la Pràctica** (enfocament d'ElectricSQL):
- Utilitza ordenació basada en timestamps amb IDs de transacció
- El servidor (Postgres) és la font de veritat
- Els canvis del client obtenen un ID de transacció (`txid`)
- El motor de sync assegura que tots els clients veuen els canvis en el mateix ordre
- No és CRDT pur però aconsegueix garanties similars

**Exemple de la Nostra App**:
```typescript
// L'usuari marca un todo com a completat
todoCollection.update(todoId, (draft) => {
  draft.completed = true;
});
// Obté txid: "12345"
// Altres clients reben: { type: 'update', txid: '12345', ... }
// Tots els clients apliquen en ordre de txid → consistència
```

**Quan Hi Ha Conflictes**:
- ElectricSQL: l'últim ID de transacció guanya
- La lògica de l'aplicació pot afegir resolució personalitzada
- Els elements eliminats romanen a la DB amb timestamp `deleted_at` (esborrat suau)

---

## Part II: ElectricSQL en la Pràctica
*Objectiu: Mostrar detalls d'implementació concrets i com tot s'ajusta*

### Diapositiva 6: Introducció a ElectricSQL (1 minut)
**Contingut**: Diagrama en tres parts: Postgres → Electric → Client


**Què és ElectricSQL?**:
- Motor de sync de codi obert per PostgreSQL
- Escrit en Elixir (altament concurrent, baixa latència)
- Converteix canvis de Postgres en streams HTTP
- Llibreries client per React, Vue, Svelte, JS vanilla

**Per què ElectricSQL?**:
- Funciona amb base de dades Postgres existent (sense migració)
- Canvis mínims al backend (només afegir contenidor Electric)
- Type-safe: genera tipus des de l'esquema de Postgres
- Framework agnòstic: funciona amb qualsevol frontend

**Model de Desplegament**:
```
Contenidor Docker:
├── PostgreSQL (5432)
└── ElectricSQL (3000)
    ├── Subscrit a replicació lògica de PG
    └── Exposa API HTTP de Shapes
```

**En el Nostre Stack**:
- TanStack Start (framework SSR de React)
- TanStack DB (base de dades reactiva del client)
- ElectricSQL (motor de sync)
- tRPC (per mutacions)
- Drizzle ORM (gestió d'esquema)

---

### Diapositiva 7: Shapes - El Concepte Central (2-3 minuts)
**Contingut**: Exemples de shapes i codi


**Què és un Shape?**:
- Una "subscripció" a un subconjunt de la teva base de dades
- Defineix quines dades sincronitzar: taules, columnes, filtres
- El client se subscriu al shape → obté dades inicials + actualitzacions en viu

**Definició de Shape** (de la nostra app):
```typescript
// Sincronitza tots els todos de l'usuari actual
const todoCollection = createCollection(
  electricCollectionOptions({
    id: 'todos',
    shapeOptions: {
      url: '/api/todos',
      params: {
        table: 'todos',
        where: 'user_id = "current_user_id"'
      }
    },
    getKey: (item) => item.id,
    schema: todoSchema,
  })
);
```

**Entre Bastidors**:
1. El client sol·licita shape: `GET /api/todos?table=todos&where=...`
2. Electric consulta Postgres per dades inicials
3. Envia resposta amb dades + `shape_id` + `offset`
4. El client emmagatzema a IndexedDB
5. El client obre connexió de long-polling: `GET /api/todos?shape_id=X&offset=Y`
6. Electric fa streaming de nous canvis a mesura que succeeixen
7. El client aplica canvis incrementalment

**Beneficis dels Shapes**:
- **Auth de gra fi**: El servidor controla a quins shapes pot accedir l'usuari
- **Eficient**: Només sincronitza el necessari
- **Composable**: Múltiples shapes poden referenciar les mateixes dades
- **Cacheable**: Els shapes tenen IDs, poden estar a cache de CDN edge

**Exemples de Shapes de la Nostra App**:
```typescript
// Shape de projectes
shapeOptions: { url: '/api/projects' }

// Shape de widgets del dashboard
shapeOptions: {
  url: '/api/dashboard-widgets',
  params: { where: `dashboard_id = "${dashboardId}"` }
}

// Shape d'usuaris (dades de perfil públic)
shapeOptions: { url: '/api/users' }
```

**Relacions Reactives**:
```typescript
// La consulta fa join de shapes automàticament
const { data } = useLiveQuery((q) =>
  q.from({ todo: todoCollection })
   .join({ project: projectCollection },
     ({ todo, project }) => eq(todo.project_id, project.id))
   .where(({ project }) => eq(project.is_favorite, true))
);
```
- El join passa al client a TanStack DB
- Temps de consulta sub-mil·lisegon (differential dataflow)
- S'actualitza automàticament quan canvia qualsevol col·lecció

---

### Diapositiva 8: Disseny de Shapes - Bones Pràctiques (2-3 minuts)
**Contingut**: Fragments amb casos d'ús ideals, dades a evitar, i regla d'or


**Fragment 0: ✅ Casos d'Ús Ideals**:
- **Metadades**: Configuració de dashboards, charts, definicions de sèries
- **Dades d'Aplicació**: Tasques, projectes, usuaris, configuració
- **Dades Col·laboratives**: Comments, assignacions, estats de treball
- **UI State**: Preferències d'usuari, layouts, vistes guardades

**Fragment 1: ❌ Evitar per a Aquestes Dades**:
- **Time Series**: Milers de punts de dades per segon (mètriques, logs)
- **Volums Massius**: Milions de files per sincronitzar al client
- **Fitxers Grans**: Vídeos, imatges d'alta resolució (usar blob storage)
- **Dades Sensibles Globals**: Informació que NO pertany al client (filtrar amb WHERE)

**Fragment 2: 💡 Regla d'Or**:
"Sync l'estat, query els data points"

**Exemple Pràctic - Dashboard de Mètriques**:
```typescript
// ✅ Sync via Electric
- Definició del dashboard
- Configuració dels charts
- Filtres i preferències
- Informació d'usuaris

// ❌ NO sync via Electric
- Els 10M data points de cada sèrie temporal

// ✅ Query via tRPC/API
- Carregar només el rang de dates visible
- Agregacions sota demanda
```

**Punts Clau**:
- Electric és perfecte per **metadades i estat d'aplicació**
- Per dades massives o d'alta freqüència: query sota demanda
- Dissenya shapes pensant en l'emmagatzematge del client
- Si tens dubtes: si són >10,000 files per usuari, probablement és massa

**Quan Dividir Shapes**:
- Usa lazy loading per shapes grans
- Pagina o filtra agressivament (últims 30 dies, projectes actius)
- Considera múltiples shapes amb carrega progressiva

---

### Diapositiva 9: Flux de Dades i Arquitectura (2-3 minuts)
**Contingut**: Exemples de codi i diagrama de flux


**El Nostre Patró**: "Lectures via Electric, Escriptures via tRPC"

**Flux de Lectura de Dades**:
```typescript
// 1. Route loader: Precarrega col·leccions
export const Route = createFileRoute('/todos/')({
  loader: async () => {
    await todosCollection.preload(); // Activa sync de shape
  },
});

// 2. Component: Consulta amb useLiveQuery
function TodoList() {
  const { data: todos } = useLiveQuery(
    (q) => q.from({ todosCollection })
          .where(({ todo }) => eq(todo.completed, false))
          .orderBy(({ todo }) => todo.created_at)
  );

  return todos.map(todo => <TodoItem key={todo.id} {...todo} />);
}
```
- **Latència zero**: Les dades ja estan a IndexedDB
- **Reactiu**: El component es re-renderitza quan canvien les dades
- **Type-safe**: Inferència completa de TypeScript des de l'esquema

**Flux d'Escriptura de Dades**:
```typescript
// L'usuari marca un todo com a completat
todoCollection.update(todoId, (draft) => {
  draft.completed = true;
  draft.completed_at = new Date().toISOString();
});

// La col·lecció crida el handler onUpdate:
onUpdate: async ({ transaction }) => {
  const { changes } = transaction.mutations[0];
  const result = await trpc.todos.update.mutate({
    id: todoId,
    ...changes
  });
  return { txid: result.txid }; // Per ordenació
}
```

**Passos del Flux**:
1. **Actualització Optimista**: TanStack DB aplica el canvi localment immediatament
2. **Actualització de UI**: Tots els hooks `useLiveQuery` es tornen a executar, la UI s'actualitza instantàniament
3. **Sync en Segon Pla**: `onUpdate` s'activa, envia mutació tRPC
4. **Escriptura a Base de Dades**: El handler tRPC escriu a Postgres, retorna txid
5. **Electric Notifica**: Veu el canvi de DB via CDC, fa streaming a tots els clients
6. **Reconciliació**: El client rep txid, coincideix amb el canvi local, confirma l'èxit
7. **Altres Clients**: Reben el canvi, actualitzen les seves DBs locals

**Gestió d'Errors**:
```typescript
onUpdate: async ({ transaction }) => {
  try {
    const result = await trpc.todos.update.mutate(...);
    return { txid: result.txid };
  } catch (error) {
    // TanStack DB fa rollback automàtic de l'actualització optimista
    throw error;
  }
}
```

**Per què tRPC per Escriptures?**:
- Type-safety end-to-end
- Validació via esquemes Zod
- Lògica de negoci en un sol lloc
- Patrons existents (endpoints REST també funcionen)

---

### Diapositiva 10: Auth, Emmagatzematge i Transport (2 minuts)
**Contingut**: Detalls tècnics d'implementació


**Flux d'Autenticació**:
```typescript
// L'endpoint proxy d'API autentica peticions
export async function GET(request: Request) {
  const user = await loadUser(request); // Verifica sessió
  if (!user) return new Response('Unauthorized', { status: 401 });

  // Filtra dades per usuari
  const electricUrl = new URL('http://electric:3000/v1/shape');
  electricUrl.searchParams.set('table', 'todos');
  electricUrl.searchParams.set('where', `user_id = '${user.id}'`);

  // Proxy a Electric
  return fetch(electricUrl);
}
```
- El client mai parla directament amb Electric
- El servidor d'app valida auth, aplica filtres per usuari
- Electric serveix API pública però darrere la capa d'auth de l'app
- Similar al patró BFF (Backend-for-Frontend)

**Seguretat a Nivell de Fila**:
- Opció 1: Filtrar al proxy (el nostre enfocament)
- Opció 2: Polítiques RLS de PostgreSQL
- Opció 3: Taules separades per tenant

**Emmagatzematge (IndexedDB)**:
```typescript
// TanStack DB emmagatzema col·leccions a IndexedDB
{
  database: 'tanstack_db',
  stores: {
    'todos': { keyPath: 'id', data: [...] },
    'projects': { keyPath: 'id', data: [...] },
    '_metadata': { shape_ids, offsets, sync_state }
  }
}
```
- Persisteix entre recarregues de pàgina
- Emmagatzematge de 50MB+ (més que localStorage)
- API asíncrona (no bloqueja el fil principal)
- Pot ser esborrat com cookies (privacitat de l'usuari)

**Mecanismes de Transport**:

**HTTP Long Polling** (primari):
```
GET /api/todos?shape_id=abc&offset=150
→ Servidor manté connexió oberta
→ Retorna quan arriben nous canvis
→ Client obre immediatament nou long-poll
```
- Funciona a tot arreu (sense problemes de firewall)
- Multiplexació HTTP/2 = eficient
- Fallback a polling regular si cal

**Server-Sent Events (SSE)** (opcional):
```
GET /api/todos?shape_id=abc&offset=150
Accept: text/event-stream
→ Servidor fa streaming d'esdeveniments contínuament
data: {"type":"insert","value":{...}}
```
- Comunicació unidireccional (servidor → client)
- Reconnexió automàtica
- Millor per canvis ràpids

**Per què no WebSocket?**:
- HTTP/2 + long-polling és suficient
- WebSocket requereix més infraestructura (complexitat de balanceig de càrrega)
- SSE proporciona punt intermedi
- Electric optimitza per HTTP estàndard

**Exemple en Viu de la Nostra App**:
```typescript
// Obre DevTools → Network → Filtra "todos"
// Veus: Sync inicial (200 OK amb dades)
//      Després: Long-poll (pending...)
//      Fes un canvi a la DB
//      Long-poll es completa amb delta
//      S'obre nou long-poll immediatament
```

---

### Diapositiva 11: Exemples d'App Real (1-2 minuts)
**Contingut**: Mostra codi real de l'app


**Exemple 1: Dashboard amb Widgets**
```typescript
// La pàgina del dashboard mostra widgets des del shape
const { data: widgets } = useLiveQuery((q) =>
  q.from({ widget: widgetsCollection })
   .where(({ widget }) => eq(widget.dashboard_id, dashboardId))
);

// Quan l'usuari afegeix un widget
widgetsCollection.insert({
  id: generateId(),
  dashboard_id: dashboardId,
  type: 'chart',
  config: { /* configuració del gràfic */ }
});
// → Actualització instant de UI
// → En segon pla: POST /api/trpc/widgets.create
// → Altres usuaris veuen aparèixer el nou widget
```

**Exemple 2: Gestió Col·laborativa de Projectes**
```typescript
// Usuari A i Usuari B veient el mateix projecte
// Usuari A marca un todo com a completat
todoCollection.update(todoId, (draft) => {
  draft.completed = true;
});

// Flux:
// - La UI de l'Usuari A s'actualitza instantàniament
// - Mutació tRPC: todos.update({ id, completed: true })
// - Postgres rep l'actualització
// - Electric veu el canvi via CDC
// - El long-poll de l'Usuari B retorna amb l'actualització
// - El useLiveQuery de l'Usuari B es torna a executar
// - L'Usuari B veu aparèixer el tick del todo
// Temps total per Usuari B: ~50-200ms
```

**Exemple 3: Consulta Complexa (Favorits)**
```typescript
// Mostra todos de projectes favorits
const { data: favoriteTodos } = useLiveQuery((q) =>
  q.from({ todo: todoCollection })
   .join({ project: projectCollection },
     ({ todo, project }) => eq(todo.project_id, project.id))
   .where(({ project }) => eq(project.is_favorite, true))
   .where(({ todo }) => eq(todo.completed, false))
);

// Això s'executa en <1ms al client
// No cal consulta al servidor
// S'actualitza automàticament quan:
// - S'afegeix/elimina un todo
// - Un todo es marca com a completat
// - Un projecte es marca/desmarca com a favorit
```

**Característiques de Rendiment**:
- Càrrega inicial: 100-500ms (obté el shape)
- Càrregues posteriors: <10ms (llegeix IndexedDB)
- Execució de consulta: <1ms (differential dataflow)
- Actualització optimista: <5ms (escriptura local)
- Latència de sync: 50-200ms (depèn de la xarxa)

---

### Diapositiva 12: Exemples Reals de Local-First (1-2 minuts)
**Contingut**: 3 cartes principals amb Linear, Figma i Notion


**📐 Linear**:
- Eina de gestió de projectes construïda amb local-first des del primer dia
- Latència <50ms per totes les accions
- Experiència instantània que diferencia el producte
- Van publicar articles detallats sobre la seva arquitectura de sync
- Enllaç: linear.app/now/scaling-the-linear-sync-engine

**Punts a Destacar**:
- No van començar amb REST i migrar - van dissenyar local-first des del principi
- El seu motor de sync és customitzat però els principis són els mateixos
- La velocitat és un avantatge competitiu clau

**🎨 Figma**:
- Col·laboració en temps real per disseny
- Utilitzen CRDTs per resolució de conflictes
- Múltiples usuaris editant simultàniament sense bloquejos
- Arquitectura multiplayer complexa
- Enllaç: figma.com/blog/how-figmas-multiplayer-technology-works

**Punts a Destacar**:
- Van construir el seu propi protocol CRDT optimitzat
- Gestionen col·laboració en objectes gràfics complexos
- Prova de concepte que local-first funciona per apps creatives

**📝 Notion**:
- Editor de documents offline-first
- Sync automàtic quan es reconnecta
- Arquitectura de blocs permet edició granular
- Gestiona conflictes elegantment
- Enllaç: notion.com/blog/how-we-made-notion-available-offline

**Punts a Destacar**:
- Van afegir suport offline després del llançament inicial
- Demostren que es pot migrar a local-first incrementalment
- L'estructura de blocs facilita la resolució de conflictes

**Missatge Clau**:
"Aquests productes demostren que local-first és viable a escala de producció amb milions d'usuaris."

**Per a l'Audiència**:
- Pregunta qui ha utilitzat aquestes eines
- Menciona la sensació d'instantaneïtat que proporcionen
- Emfatitza: no és teoria - és producció a gran escala

---

## Declaracions Finals

### Diapositiva 13: Beneficis i Reptes (1 minut)
**Contingut**: Vista equilibrada


**Resum de Beneficis** (Fragment 0 - tots apareixen alhora):
✅ **Millor UX**: Interaccions instantànies, "feeling" d'aplicació nativa
✅ **Suport Offline**: Funcionalitat bàsica sense internet
✅ **Càrrega Reduïda del Servidor**: La majoria de lectures passen al client
✅ **Col·laboració en Temps Real**: Per defecte, no afegida posteriorment
✅ **Type Safety**: TypeScript end-to-end des de DB a UI

**Reptes i Compromissos** (Fragment 1 - tots apareixen alhora):

⚠️ **Canvi de Paradigma**:
- Més lògica al client, cal entendre sistemes distribuïts
- Pas de model petició-resposta a consistència eventual
- Requereix formació de l'equip

⚠️ **Consideracions d'Emmagatzematge**:
- Cal dissenyar shapes per no sincronitzar dades innecessàries al client
- IndexedDB té límits segons navegador
- Solució: Filtrar i paginar shapes agressivament (veure slide de bones pràctiques)

⚠️ **Càrrega Inicial**:
- Primera visita: descarrega shape. Solució: lazy loading
- Càrregues posteriors són instantànies (IndexedDB)

⚠️ **Debug de l'Estat Client**:
- Cal entendre si els clients estan sincronitzats amb la DB
- Més complex que debugging tradicional petició-resposta
- ElectricSQL té devtools per ajudar

⚠️ **Arquitectura "Nova"**:
- Patró relativament nou, menys recursos i comunitat que REST/GraphQL
- Però està guanyant tracció (Linear, Figma, Notion ho demostren)
- Documentació i eines milloren ràpidament

**Quan Usar Local-First**:
- La col·laboració és una funcionalitat central
- La funcionalitat offline és important
- L'experiència d'usuari és un diferenciador competitiu
- Tens 1000+ usuaris concurrents llegint les mateixes dades
- Arquitectura mobile-first o PWA

**Quan NO Usar**:
- Panells d'admin CRUD simples
- Prototips/MVPs (afegeix després si cal)
- L'equip no té experiència en sistemes distribuïts
- La base de dades no és Postgres (o no pots migrar)

---

### Diapositiva 14: Gràcies i Demo (1 minut)
**Contingut**: Enllaços i crida a l'acció


**Idees Clau**:
1. Local-first = les dades viuen al dispositiu, sincronitzen en segon pla
2. No només offline - es tracta de UX instant i fiable
3. ElectricSQL ho fa pràctic amb Postgres
4. **Provat a escala per Linear, Figma i Notion** - no és teoria, és producció

**Recursos**:
- **Ink & Switch**: Articles de recerca sobre local-first
- **electric-sql.com**: Documentació, guies, exemples
- **frontendatscale.com/blog/tanstack-db**: Guia interactiva
- **Blog de Linear**: Com van construir local-first des de zero
- **Blog de Figma**: Immersió profunda en tecnologia multiplayer

**Prova-ho**:
- La nostra app demo: [Mostra demo en viu]
- Obre DevTools → Network → Veu shapes sincronitzant
- Fes canvis → Veu actualitzacions optimistes
- Obre en dues finestres → Veu sync en temps real

**Preguntes Benvingudes**:
- Detalls d'implementació tècnica
- Decisions d'arquitectura per al teu cas d'ús
- Estratègies de migració des de REST/GraphQL

---

## FAQ

### Conceptes Generals

**P: És el mateix que offline-first?**
R: Offline-first és un subconjunt de local-first. Local-first significa que la base de dades local és primària, el servidor és secundari. Offline és un benefici, però el rendiment instantani i el sync en temps real són igualment importants.

**P: No vol dir això que el client té tota la base de dades?**
R: No. Els shapes et permeten definir exactament quines dades sincronitzar. Exemple: sincronitza només els todos de l'usuari actual, no de tots els usuaris. Dissenyes shapes per mantenir l'emmagatzematge del client manejable.

**P: I si les meves dades són massa grans per sincronitzar?**
R: Utilitza paginació i filtratge en shapes. Exemple: sincronitza els últims 30 dies de dades, carrega dades més antigues sota demanda. Tracta els shapes com vistes materialitzades.

**P: Com és diferent de GraphQL?**
R: GraphQL encara requereix petició-resposta per cada consulta. Local-first sincronitza dades un cop, després les consultes passen localment. GraphQL pot ser utilitzat per mutacions en arquitectura local-first.

**P: És com Redux/Zustand/MobX?**
R: Aquestes són llibreries de gestió d'estat. TanStack DB és una base de dades amb consultes, índexs i persistència. És més com SQLite al navegador.

### Implementació Tècnica

**P: Què passa si el servidor està caigut?**
R: L'app continua funcionant amb dades locals. Les mutacions s'encuen. Quan el servidor torna, els canvis encuats se sincronitzen automàticament. Com funciona Gmail offline.

**P: Com es gestiona l'autenticació amb shapes?**
R: L'endpoint proxy al teu servidor autentica peticions, aplica filtres específics per usuari, després fa proxy a Electric. Exemple a la nostra app: `/api/todos` verifica sessió, afegeix `where: user_id = X`.

**P: Puc usar això amb MySQL/MongoDB?**
R: ElectricSQL només suporta Postgres. Altres motors de sync: PGlite (Postgres WASM), Replicache (funciona amb qualsevol backend), PowerSync (Postgres/MySQL), Instant.db (servei cloud).

**P: Quantes dades pot emmagatzemar IndexedDB?**
R: Varia segons el navegador: Chrome ~60% d'espai lliure de disc, Firefox ~50%, Safari ~1GB. Pràcticament, apunta a <50MB per usuari per fiabilitat.

**P: I les apps mòbils?**
R: Els mateixos patrons funcionen. React Native usa SQLite en lloc d'IndexedDB. Electric té exemples mòbils. Millor suport offline que web (emmagatzematge natiu).

**P: Cal WebSockets?**
R: No. Electric usa HTTP long-polling per defecte. Funciona a tot arreu, compatible amb firewalls. SSE és opcional. WebSockets afegeixen complexitat sense molt benefici per sync.

**P: Com es prova aquesta arquitectura?**
R: Tests unitaris per components (mock useLiveQuery), tests d'integració amb base de dades de test, tests E2E amb instància real d'Electric. Més difícil que REST però factible.

### Específic d'ElectricSQL

**P: Electric escala a milions d'usuaris?**
R: Sí, però amb advertiments. Electric mateix pot gestionar-ho (concurrència d'Elixir). El coll d'ampolla sol ser els slots de replicació de Postgres. Usa Electric Cloud per escala de producció.

**P: Puc auto-allotjar Electric?**
R: Sí, és codi obert. Contenidor Docker disponible. Cal gestionar la configuració de replicació lògica de Postgres. Electric Cloud és opció gestionada.

**P: Quin és el preu?**
R: El nucli de codi obert és gratuït. Electric Cloud té tier gratuït + plans de pagament. Auto-allotjament: només costos d'infraestructura (servidor + Postgres).

**P: Com funcionen les migracions d'esquema?**
R: Crea migració de Postgres (Drizzle, Prisma, etc). Electric detecta canvis d'esquema automàticament. Els clients re-sincronitzen shapes després del canvi de versió d'esquema. Planifica compatibilitat cap enrere.

**P: Puc usar Electric amb una app existent?**
R: Sí. Afegeix contenidor Electric, endpoints proxy, migra consultes incrementalment. Pot executar híbrid: algunes consultes via Electric, altres via REST/GraphQL. Migració gradual possible.

**P: Què passa amb triggers i funcions de base de dades?**
R: Funcionen bé. Electric sincronitza el resultat dels triggers. Exemple: trigger `updated_at` s'activa → Electric veu la fila actualitzada → sincronitza als clients.

### Arquitectura i Patrons

**P: Per què usar tRPC per escriptures en lloc d'Electric?**
R: Separació de preocupacions. Electric optimitzat per lectures. tRPC dóna type-safety, validació, lògica de negoci en un sol lloc. També es podria usar REST/GraphQL.

**P: Electric pot gestionar escriptures?**
R: Electric sincronitza bidirecionalment, així que sí. Però preferim APIs d'escriptura explícites (tRPC) per validació, autorització, efectes secundaris. Electric brilla per lectures.

**P: Com es gestiona lògica de negoci complexa?**
R: Al servidor. Mutació tRPC → valida → escriu a Postgres → executa lògica de negoci → Electric sincronitza resultat als clients. El client no necessita conèixer regles de negoci.

**P: I analytics/logging?**
R: Fa seguiment de mutacions al servidor (en handlers tRPC). Usa triggers de Postgres per logs d'auditoria. Electric també pot sincronitzar taules d'auditoria. Al client: fa seguiment d'accions d'usuari normalment.

**P: Puc tenir múltiples instàncies d'Electric?**
R: Sí, per escalat horitzontal. Cada una observa el mateix Postgres. Els clients poden connectar a qualsevol instància. El balancejador de càrrega distribueix peticions. Totes les instàncies serveixen les mateixes dades.

**P: Com és diferent de Firebase/Supabase Realtime?**
R: Conceptes similars. Diferències:
- Electric: Porta el teu propi Postgres, codi obert
- Firebase: Ecosistema tancat, NoSQL
- Supabase: Postgres però mecanisme de sync diferent (Realtime usa websockets)
- Electric: Optimitzat per shapes i differential dataflow

### Seguretat i Privacitat

**P: És segur sincronitzar dades als clients?**
R: Només sincronitza dades que l'usuari està autoritzat a veure. Usa filtres de shapes i proxies d'auth. Mateix principi que APIs REST - no enviïs dades que l'usuari no hauria d'accedir.

**P: I GDPR/privacitat de dades?**
R: Dades a IndexedDB = dispositiu de l'usuari = bo per privacitat. L'usuari pot esborrar-ho en qualsevol moment. Encara cal eliminació de dades al servidor per compliment GDPR.

**P: Els usuaris poden inspeccionar IndexedDB i veure dades?**
R: Sí, igual que poden inspeccionar localStorage o la pestanya Network. No sincronitzis dades sensibles que no enviaries en respostes d'API. Xifra camps sensibles si cal.

**P: Com evites la manipulació de dades locals?**
R: Els clients poden modificar dades locals, però el servidor valida totes les escriptures. Les actualitzacions optimistes es reverteixen si el servidor rebutja. Tracta el client com a no confiable, igual que amb API REST.

### Rendiment

**P: Això usa més ample de banda que REST?**
R: Inicialment: més (descarrega dades del shape). Posteriorment: menys (només sincronitza deltas). Punt d'equilibri després de ~3-5 càrregues de pàgina. Apps de llarga durada (SPAs) beneficien més.

**P: Quina velocitat té?**
R: Consultes locals: <1ms. Actualització optimista: ~5ms. Sync de servidor: 50-200ms. L'usuari percep tot com a instantani. REST tradicional: 200-1000ms per acció.

**P: I l'ús de memòria?**
R: IndexedDB no es carrega tot a memòria d'un cop. Les consultes de TanStack DB fan streaming des d'IndexedDB. Ús típic: 10-50MB RAM. Dissenya shapes per evitar carregar dades innecessàries.

**P: Funciona en xarxes lentes?**
R: Millor que apps tradicionals. La xarxa lenta només afecta el sync, no la resposta de la UI. Els canvis s'encuen i sincronitzen quan sigui possible. Els usuaris poden treballar a velocitat completa independentment de la connexió.

---

## Referència Ràpida: Patrons de Codi

### Definint una Col·lecció
```typescript
export const todoCollection = createCollection(
  electricCollectionOptions({
    id: 'todos',
    shapeOptions: {
      url: '/api/todos',
      params: { table: 'todos' }
    },
    schema: todoSchema,
    getKey: (item) => item.id,

    onInsert: async ({ transaction }) => {
      const item = transaction.mutations[0].value;
      const result = await trpc.todos.create.mutate(item);
      return { txid: result.txid };
    },

    onUpdate: async ({ transaction }) => {
      const { original, changes } = transaction.mutations[0];
      const result = await trpc.todos.update.mutate({
        id: original.id,
        ...changes
      });
      return { txid: result.txid };
    },

    onDelete: async ({ transaction }) => {
      const item = transaction.mutations[0].original;
      const result = await trpc.todos.delete.mutate(item.id);
      return { txid: result.txid };
    }
  })
);
```

### Usant en Components
```typescript
// Precàrrega en ruta
export const Route = createFileRoute('/todos/')({
  loader: () => todoCollection.preload()
});

// Consulta en component
function TodoList() {
  const { data: todos } = useLiveQuery((q) =>
    q.from({ todo: todoCollection })
     .where(({ todo }) => eq(todo.completed, false))
  );

  return todos.map(todo => <TodoItem key={todo.id} {...todo} />);
}

// Mutació
function TodoItem({ id }) {
  const handleComplete = () => {
    todoCollection.update(id, (draft) => {
      draft.completed = true;
    });
  };
}
```

### Patró de Proxy d'Auth
```typescript
// Ruta d'API: /api/todos.ts
export async function GET(request: Request) {
  const user = await authenticate(request);
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const electricUrl = new URL(process.env.ELECTRIC_URL);
  electricUrl.searchParams.set('table', 'todos');
  electricUrl.searchParams.set('where', `user_id = '${user.id}'`);

  // Copia paràmetres de consulta del client
  const clientParams = new URL(request.url).searchParams;
  for (const [key, value] of clientParams) {
    if (key !== 'table' && key !== 'where') {
      electricUrl.searchParams.set(key, value);
    }
  }

  return fetch(electricUrl);
}
```

---

## Consells per a la Presentació

1. **Timing**: Respecta els límits de temps per secció. Usa un temporitzador.

2. **Demos Interactives**:
   - Obre DevTools per mostrar peticions de xarxa
   - Demostra el mode offline (DevTools → Network → Offline)
   - Mostra dues finestres del navegador sincronitzant en temps real

3. **Engagement amb l'Audiència**:
   - Pregunta si algú ha usat Linear/Figma i ha sentit la sensació "instantània"
   - Pausa per preguntes després de la Part I (teoria) i Part II (pràctica)

4. **Preguntes Comunes a Anticipar**:
   - "Per què no simplement usar subscripcions de GraphQL?"
   - "I els costos/rendiment a escala?"
   - "Quina dificultat té la migració des d'una API REST existent?"

5. **Tancament**:
   - Emfatitza: Això no és experimental - Linear, Figma ho fan a escala
   - Menciona: Electric Cloud fa això production-ready
