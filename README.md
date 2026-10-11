# Product Creator

App e-commerce para que un vendedor suba una foto de producto, la IA la mejore
y la convierta en un video listo para redes sociales.

Usa **Google Gemini (nano-banana)** para la edición de imagen preservando el producto
y **Google Veo** (`@google/genai`) para la generación de video publicitario.

## Features

- Upload de foto + descripción corta + categoría
- **Edición de imagen con nano-banana (Gemini 2.5 Flash Image)** — preserva el producto mientras cambia fondo / estilo
- **Generación de video con Google Veo** (`veo-2.0-generate-001` vía `@google/genai`) — el primer frame es tu producto real
- 6 categorías con prompts por defecto editables: Zapatos, Ropa, Electrónica, Cosméticos, Alimentos, Hogar
- **Polling local continuo** sin requerir webhooks ni ngrok
- Publicación a Instagram, TikTok y Facebook (config opcional)
- Tracking de jobs en JSON local (`data/jobs.json`)

## Stack

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS 3.4
- Sin base de datos (jobs.json + filesystem)
- Google Gen AI SDK (`@google/genai`) con Google Veo & Gemini
- Instagram Graph API, TikTok Open API, Facebook Graph API

## Configuración

```bash
cp .env.local.example .env.local
# editar .env.local con tu GEMINI_API_KEY
npm install
npm run dev
```

Variables mínimas:
- `GEMINI_API_KEY` (usada tanto para nano-banana como para Google Veo)
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
7. Backend llama Google Veo (SDK @google/genai) con la foto ORIGINAL como frame inicial
8. UI hace polling a /api/jobs/{id} cada 4s
9. /api/jobs/{id} consulta el estado de la operación de Veo con client.operations.getVideosOperation
10. Cuando Veo termina, el endpoint descarga el mp4 a /data/outputs y marca el job como "ready"
11. UI muestra ResultDisplay con foto original + editada + video + publicar
```

## Estructura

```
app/
  page.tsx                          # formulario
  results/[id]/page.tsx             # página de resultados
  api/
    upload/                         # POST: crea job desde form-data
    jobs/[id]/                      # GET: estado del job (polling + resolución de Veo)
    jobs/[id]/generate/             # POST: image edit (nano-banana) + video async (Veo)
    files/[...path]/                # GET: sirve uploads/outputs estáticos
    social/post/                    # POST: publica a IG/TT/FB
components/
  ProductForm.tsx
  CategoryPicker.tsx
  ProcessingStatus.tsx
  ResultDisplay.tsx
  ui/ (button, input, textarea)
lib/
  veo.ts                            # cliente Google Veo (@google/genai)
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

## Servicios y Modelos Usados

- **nano-banana (Gemini 2.5 Flash Image)**: `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=$GEMINI_API_KEY`
  - Input: `contents[0].parts: [{text}, {inline_data: {mime_type, data: base64}}]`
  - Config: `generationConfig.responseModalities: ["IMAGE"]`
  - Output: `candidates[0].content.parts[].inline_data.data` (base64)

- **Google Veo Video Generation**: `@google/genai` (`ai.models.generateVideos` / `veo-2.0-generate-001`)
  - Input: `{ prompt, image: { imageBytes, mimeType } }`
  - Polling: `ai.operations.getVideosOperation({ operation })`
  - Output: Video bytes o URI descargable a `/data/outputs`

## Limitaciones conocidas

- Sin auth: cualquiera con la URL puede crear jobs. Agregar NextAuth si lo vas a exponer.
- Jobs sin expiración: el `data/jobs.json` crece indefinidamente.
- Publicar a TikTok requiere App registrada y video en URL pública accesible (la actual implementación usa la URL del propio servidor).

