# Repaso de Francés

App para repasar el vocabulario de francés (438+ palabras extraídas de tu progreso en Duolingo, más las que agregues tú), organizada **por categoría gramatical** en vez de por lecciones al azar: pronombres, posesivos, artículos, verbos, sustantivos (con género), adjetivos, adverbios, preposiciones, interrogativos, conjunciones/interjecciones, números, expresiones y países/nacionalidades.

## Tipos de ejercicio por categoría

- **Flashcards** con repetición espaciada (algoritmo SM-2, guardado en `localStorage`)
- **Opción múltiple** (francés → español y español → francés)
- **Masculino o femenino** (para sustantivos, adjetivos, artículos, posesivos y nacionalidades)
- **Conjugación** (presente, imparfait, futur simple y passé composé de être, avoir, aller, vouloir, venir, connaître, etc.)
- **Escribir la palabra** (completar en francés a partir de la traducción)
- **Dictado** (escuchas la pronunciación por voz y escribes lo que oíste, sin ver la palabra)

## Lo que no te da Duolingo

- **🔊 Pronunciación bajo demanda**: botón de escuchar en cualquier palabra (flashcards, ejercicios, tu propio vocabulario), usando la síntesis de voz del navegador — sin límites ni esperar a que la app tenga audio grabado para esa palabra.
- **🎯 Palabras difíciles**: pantalla dedicada que calcula tu porcentaje real de aciertos por palabra y te deja repasar exactamente las que más fallas, sin importar su categoría gramatical.
- **🎧 Dictado**: ejercicio de solo oído — pronunciación primero, palabra escrita después.
- Explicaciones de por qué algo es difícil (concordancia de posesivos, género, etc.) en las descripciones de cada categoría, en vez de lecciones gamificadas sin contexto gramatical.

## Otras funciones

- Frases de ejemplo, agregar tu propio vocabulario, estadísticas, racha diaria, logros, modo claro/oscuro, atajos de teclado, PWA instalable/offline.

## Instalar en iPhone

1. Abre la app en Safari (no en otro navegador — "Agregar a inicio" solo instala PWAs de forma completa desde Safari en iOS).
2. Toca el botón de **Compartir** (el cuadrado con la flecha hacia arriba).
3. Elige **"Agregar a la pantalla de inicio"**.
4. Se instala con su propio ícono y abre a pantalla completa, sin la barra de Safari, respetando el notch y la barra inferior del teléfono.

## Desarrollo

```bash
npm install
npm run dev
```

## Tests y lint

```bash
npm run test
npm run lint
```

## Build

```bash
npm run build
```

## Sincronización en la nube (opcional)

La app funciona 100% offline con `localStorage` sin ninguna configuración
extra. Si además quieres sincronizar tu progreso entre dispositivos:

1. Crea un proyecto gratuito en [supabase.com](https://supabase.com).
2. En el **SQL Editor** del proyecto, ejecuta:

   ```sql
   create table progress (
     user_id uuid primary key references auth.users(id) on delete cascade,
     srs jsonb not null default '{}',
     custom_vocab jsonb not null default '[]',
     updated_at timestamptz not null default now()
   );

   alter table progress enable row level security;

   create policy "Users can manage their own progress"
     on progress for all
     using (auth.uid() = user_id)
     with check (auth.uid() = user_id);
   ```

3. Copia `.env.example` a `.env` y completa `VITE_SUPABASE_URL` y
   `VITE_SUPABASE_ANON_KEY` con los valores de tu proyecto (Project Settings →
   API).
4. Reinicia `npm run dev` (o volvé a desplegar). En la app, entra a
   **☁️ Cuenta y sync** desde la pantalla principal e inicia sesión con tu
   correo (enlace mágico, sin contraseña).

Sin estas variables de entorno, la sección de sincronización simplemente
muestra un aviso y el resto de la app sigue funcionando sin cambios.
