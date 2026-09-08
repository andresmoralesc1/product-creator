# Product Creator

App e-commerce para que un vendedor suba una foto de producto, la IA la mejore
y la convierta en un video listo para redes sociales.

Inspirado en `marketing-app` (mismo autor) — reemplaza Google Imagen/Veo por
MiniMax, agrega categorías con prompts editables, publicación en redes y
almacenamiento local.

## Features

- Upload de foto + descripción corta + categoría
- **Edición de imagen con nano-banana (Gemini 2.5 Flash Image)** — preserva el producto mientras cambia fondo / estilo
- **Generación de video desde la foto original con MiniMax** (`/v2/video_generation`, async, webhook) — el primer frame es tu producto real
- 6 categorías con prompts por defecto editables: Zapatos, Ropa, Electrónica, Cosméticos, Alimentos, Hogar
- Webhook de MiniMax con handshake de challenge → descarga automática del video al filesystem local
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
- `MINIMAX_API_KEY` (video)
- `GEMINI_API_KEY` (image edit, nano-banana)
- `APP_BASE_URL` (necesario para webhooks, debe ser accesible públicamente)
- `STORAGE_DIR` (default: `<proyecto>/data`)

Las credenciales de redes sociales son opcionales; si están vacías esos botones
simplemente no se pueden usar.

## Flujo

```
1. Usuario sube foto + descripción + categoría en /
2. POST /api/upload guarda la foto, crea job, devuelve jobId
3. UI redirige a /results/{jobId}
4. Usuario hace clic en "Generar contenido AI" → POST /api/jobs/{id}/generate
5. Backend llama nano-banana (Gemini 2.5 Flash Image) — edita la foto preservando el producto
6. Guarda el base64 de la imagen editada en /data/outputs
7. Backend llama MiniMax /v2/video_generation con la foto ORIGINAL como first_frame
8. UI hace polling a /api/jobs/{id} cada 4s
9. MiniMax hace handshake challenge con /api/webhooks/minimax
10. Cuando el video termina, MiniMax POSTea update a /api/webhooks/minimax
11. Webhook descarga el mp4 a /data/outputs y marca el job como "ready"
12. UI muestra ResultDisplay con foto original + editada + video + publicar
```

## Estructura

```
app/
  page.tsx                          # formulario
  results/[id]/page.tsx             # página de resultados
  api/
    upload/                         # POST: crea job desde form-data
    jobs/[id]/                      # GET: estado del job (polling)
    jobs/[id]/generate/             # POST: image sync + video async
    webhooks/minimax/               # POST: challenge handshake + video updates
    files/[...path]/                # GET: sirve uploads/outputs estáticos
    social/post/                    # POST: publica a IG/TT/FB
components/
  ProductForm.tsx
  CategoryPicker.tsx
  ProcessingStatus.tsx
  ResultDisplay.tsx
  ui/ (button, input, textarea)
lib/
  minimax.ts                        # cliente API MiniMax (video)
  nano-banana.ts                    # cliente Gemini 2.5 Flash Image (image edit)
  storage.ts                        # filesystem local
  categories.ts                     # 6 categorías + prompts por categoría
  jobs.ts                           # CRUD sobre data/jobs.json
  types.ts
  validations.ts                    # zod
  social/
    instagram.ts
    tiktok.ts
    facebook.ts
data/
  uploads/                          # fotos originales
  outputs/                          # imagen marketing + videos
  jobs.json                         # estado de jobs
```

## Endpoints externos usados

- **nano-banana (Gemini 2.5 Flash Image)**: `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=$GEMINI_API_KEY`
  - Input: `contents[0].parts: [{text}, {inline_data: {mime_type, data: base64}}]`
  - Config: `generationConfig.responseModalities: ["IMAGE"]`
  - Output: `candidates[0].content.parts[].inline_data.data` (base64)
  - Precio: $0.039/imagen

- **MiniMax video generation**: `POST https://api.minimax.io/v2/video_generation`
  - Input: `{ model: "MiniMax-H3", content: [{type:"text"},{type:"image_url",role:"first_frame"}], resolution, duration, callback_url }`
  - Output: `{ task_id }`
  - Query: `GET https://api.minimax.io/v2/query/video_generation/{task_id}`
  - Webhook con handshake `challenge`.

## Limitaciones conocidas

- Sin auth: cualquiera con la URL puede crear jobs. Agregar NextAuth si lo vas a exponer.
- Jobs sin expiración: el `data/jobs.json` crece indefinidamente.
- Publicar a TikTok requiere App registrada y video en URL pública accesible (la actual implementación usa la URL del propio servidor).
- Webhook requiere URL pública (ngrok o dominio real en prod).
