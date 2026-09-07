# Product Creator

App e-commerce para que un vendedor suba una foto de producto, la IA la mejore
y la convierta en un video listo para redes sociales.

Inspirado en `marketing-app` (mismo autor) — reemplaza Google Imagen/Veo por
MiniMax, agrega categorías con prompts editables, publicación en redes y
almacenamiento local.

## Features

- Upload de foto + descripción corta + categoría
- Edición de foto con MiniMax (image edit)
- Generación de video desde la foto editada (image-to-video, ~5 s)
- 6 categorías con prompts por defecto editables: Zapatos, Ropa, Electrónica, Cosméticos, Alimentos, Hogar
- Webhook de MiniMax → descarga automática de outputs al filesystem local
- Publicación a Instagram, TikTok y Facebook (config opcional)
- Tracking de jobs en JSON local (`data/jobs.json`)

## Stack

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS 3.4
- Sin base de datos (jobs.json + filesystem)
- MiniMax API para AI
- Instagram Graph API, TikTok Open API, Facebook Graph API

## Configuración

```bash
cp .env.local.example .env.local
# editar .env.local con tus keys reales
npm install
npm run dev
```

Variables mínimas:
- `MINIMAX_API_KEY`
- `MINIMAX_WEBHOOK_SECRET` (para validar firma)
- `APP_BASE_URL` (necesario para webhooks)
- `STORAGE_DIR` (default: `<proyecto>/data`)

Las credenciales de redes sociales son opcionales; si están vacías esos botones
simplemente no se pueden usar.

## Flujo

```
1. Usuario sube foto + descripción + categoría en /
2. POST /api/upload guarda la foto, crea job, devuelve jobId
3. UI redirige a /results/{jobId}
4. Usuario hace clic en "Iniciar edición" → POST /api/minimax/edit
5. MiniMax procesa y hace POST a /api/webhooks/minimax cuando termina
6. Webhook descarga la imagen editada a /data/outputs y actualiza el job
7. UI hace polling a /api/jobs/{id} cada 4s
8. Cuando editedPhotoUrl aparece, usuario hace clic en "Generar video"
9. POST /api/minimax/video inicia la tarea; webhook descarga el mp4
10. Cuando status === "ready", UI muestra ResultDisplay con descargas y
    formulario para publicar a redes
```

## Estructura

```
app/
  page.tsx                   # formulario
  results/[id]/page.tsx      # página de resultados
  api/
    upload/                  # POST: crea job desde form-data
    jobs/[id]/               # GET: estado del job (polling)
    minimax/edit/            # POST: inicia edición de imagen
    minimax/video/           # POST: inicia generación de video
    webhooks/minimax/        # POST: recibe resultados async
    files/[...path]/         # GET: sirve uploads/outputs estáticos
    social/post/             # POST: publica a IG/TT/FB
components/
  ProductForm.tsx
  CategoryPicker.tsx
  ProcessingStatus.tsx
  ResultDisplay.tsx
  ui/ (button, input, textarea)
lib/
  minimax.ts                 # cliente API MiniMax
  storage.ts                 # filesystem local
  categories.ts              # 6 categorías + prompts por categoría
  jobs.ts                    # CRUD sobre data/jobs.json
  types.ts
  validations.ts             # zod
  social/
    instagram.ts
    tiktok.ts
    facebook.ts
data/
  uploads/                   # fotos originales
  outputs/                   # fotos editadas y videos
  jobs.json                  # estado de jobs
```

## Endpoints MiniMax asumidos

El cliente en `lib/minimax.ts` apunta a endpoints que se deben ajustar al
contrato real de tu plan MiniMax:

- `POST /image/edit` — recibe `{ image, prompt, webhook_url }`
- `POST /video/image-to-video` — recibe `{ image, motion_prompt, duration, webhook_url }`
- `GET /tasks/{id}` — status polling fallback
- Webhooks con header `x-minimax-signature` (HMAC-SHA256)

Edita `lib/minimax.ts` si los paths reales son distintos.

## Limitaciones conocidas

- Sin auth: cualquiera con la URL puede crear jobs. Agregar NextAuth si lo vas a exponer.
- Jobs sin expiración: el `data/jobs.json` crece indefinidamente.
- Publicar a TikTok requiere App registrada y video en URL pública accesible (la actual implementación usa la URL del propio servidor).
- Webhook requiere URL pública (ngrok o dominio real en prod).
