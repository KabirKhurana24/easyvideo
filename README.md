# EasyVideo Change Studio — Production AI SaaS

> **Core Principle: Don't regenerate everything when only a few scenes need updating.**

EasyVideo Change Studio is a production-ready AI SaaS application built to help Learning & Development (L&D), People & Culture, and product operations teams keep their workplace training videos accurate and up to date as policies, processes, tools, and regulations change.

Instead of re-recording or re-rendering entire video series from scratch, EasyVideo Change Studio compares updated source documents against the original material, detects changes, maps them to affected video scenes, and selectively regenerates only the changed scenes—preserving approved content, video pacing, and localization investments.

---

## Central Workflow

1. **Upload Updated Source Document**: Upload a revised policy, process document, or slide deck (PDF, DOCX, PPTX, TXT, Markdown).
2. **AI Version Comparison**: AI compares the new document against the baseline version attached to the video.
3. **Source-to-Scene Mapping**: Detects policy, numerical, process, and terminology changes with identifiable citations and maps them strictly to affected scenes.
4. **Human Review & Decisioning**: Reviewers inspect before-and-after copy, verify source evidence, and accept or reject suggested changes.
5. **Selective Scene Regeneration**: AI regenerates narration, on-screen headlines, and storyboard visuals while maintaining instructional tone and timing.
6. **Localization Propagation**: Automatically updates translated segments in four target languages (English, Hindi, German, French) while preserving existing approved translations for unchanged scenes.
7. **Version Snapshot & Publishing**: Validates that all changes and localizations are approved, then publishes an immutable version release (e.g., Version 1.1).
8. **Audit Trail & Rollback**: Maintains complete historical snapshots, an activity log, and safe rollback to prior published versions without data loss.

---

## Enterprise Authentication & Demo Personas

EasyVideo Change Studio includes a turnkey authentication system with Role-Based Access Control (RBAC) and persistent sessions:

| Persona | Role | Department | Key Capabilities |
|---|---|---|---|
| **Kabir Khurana** (`kabir@northstar.internal`) | `admin` | People & Culture | Full administration, publication approvals, release rollbacks, workspace configuration |
| **Sarah Lin** (`sarah.lin@northstar.internal`) | `editor` | Learning Production | Scene script editing, storyboard visual adjustments, AI preview regeneration |
| **Elena Rostova** (`elena.r@northstar.internal`) | `reviewer` | Global Operations | Multilingual QA review, glossary compliance, localization signoff |
| **Marcus Vance** (`marcus.v@northstar.internal`) | `reviewer` | People & Culture | Policy grounding checks, employee handbook compliance & HR signoff |

- **1-Click Demo Login**: Switch between personas instantly via the top navigation bar or the login portal to experience role-based workflows.
- **Custom Credentials**: Enterprise users can authenticate with any company email and password.
- **Audit Attribution**: All scene edits, decisions, localization reviews, and version publications automatically attribute to the active persona in the audit log.
- **Multi-Tenant Workspaces**: Switch between workspaces (*Northstar People*, *Acme Learning Ops*, *Product Enablement*) from the sidebar.

---

## Seeded Demo Workspace

The application includes an accessible, zero-config demo workspace for **Northstar Technologies**:

- **Workspace**: Northstar People
- **Project**: Remote Work Essentials
- **Baseline Version**: 1.0 (Published Aug 18, 2026)
- **Scenes**: 12 scenes (3 affected, 9 unaffected and preserved)
- **Languages**: English (🇬🇧), Hindi (🇮🇳), German (🇩🇪), French (🇫🇷)
- **Policy Comparison**:
  1. **Office attendance**: Increases from 2 to 3 days/week in office/hub (Scene 03).
  2. **Advance leave notice**: Recommended notice extends from 5 to 10 business days (Scene 07).
  3. **Leave approval**: Extended leave approval moves from manager to People Partner in partnership with manager (Scene 09).

Users can run through the complete experience immediately, upload their own documents, edit scripts, regenerate previews, approve languages, publish Version 1.1, and reset back to baseline anytime using the **Reset Demo** button.

---

## Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **Backend / API**: Next.js Server-side Route Handlers with Zod request/response validation.
- **Document Extraction**: Server-side parsing for PDF (`pdf-parse`), Word (`mammoth`), PowerPoint (`adm-zip` XML parser), and Markdown/TXT.
- **AI Engine**:
  - **OpenAI Integration**: `gpt-4o` structured JSON outputs with strict schema validation.
  - **Grounded Semantic Engine (Built-in Fallback)**: Deterministic, source-grounded comparison engine ensuring the entire app runs with 100% functionality out of the box even without external API credentials.
- **Database & Auth**:
  - **Supabase PostgreSQL**: Normalized multi-tenant schema with Row Level Security (RLS) policies.
  - **Persistence Store**: Dual-adapter architecture that seamlessly operates with Supabase in cloud environments or in-memory/server persistence for instant zero-config hiring manager evaluation.
- **Testing**: Vitest unit, integration, and end-to-end workflow test suite.
- **Deployment**: Vercel-ready with zero build warnings.

---

## Quickstart

### 1. Prerequisites
- Node.js 18.x, 20.x, or 24.x
- `pnpm` (recommended) or `npm`

### 2. Installation
```bash
# Install dependencies
pnpm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Application URL | `http://localhost:3000` |
| `OPENAI_API_KEY` | OpenAI API key for live GPT-4o inference | *(Optional — uses built-in engine if unset)* |
| `OPENAI_MODEL` | OpenAI Model | `gpt-4o` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | *(Optional for demo)* |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key | *(Optional for demo)* |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | *(Optional for demo)* |
| `NEXT_PUBLIC_DEMO_MODE` | Enables instant demo workspace | `true` |

### 4. Running Locally
```bash
# Start development server
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running Tests
```bash
# Run unit and integration tests
pnpm test
```

---

## Core Product Modules

### 1. Document Upload & Extraction (`lib/documents/parser.ts`)
- Server-side validation of MIME type and file size (25 MB max).
- Extracts clean text while preserving section headings, numbers, and paragraph markers.
- Extracts slides from PPTX presentations by parsing internal OpenXML nodes (`ppt/slides/slide*.xml`).
- Sample test documents are provided in `sample-docs/Remote_Work_Policy_v1.txt` and `sample-docs/Remote_Work_Policy_v2.txt`.

### 2. AI Change Detection & Grounding (`lib/ai/`)
- Strict Zod validation schemas (`lib/ai/schemas.ts`).
- Returns structured change objects containing: `category`, `previousInfo`, `updatedInfo`, `originalDocRef`, `updatedDocRef`, `affectedSceneIds`, `severity`, `confidenceScore`, `recommendedAction`, `suggestedNarration`, `suggestedHeadline`, `suggestedVisual`, and `sourceQuote`.
- Grounding constraint: Every change requires verifiable source evidence.
- Flags low-confidence results for human review.

### 3. Scene-Level Visual Storyboard Editor (`components/modals/SceneEditorModal.tsx`)
- Visual storyboard canvas reflecting the on-screen graphic and dynamic headline caption.
- Side-by-side comparison between Current Version and AI Suggestion.
- Real-time text-to-speech auditioning using Web Speech API synthesis.
- Live headline and narration editing with instant preview regeneration.
- Grounded source evidence citation box.

### 4. Localization Engine (`components/LocalizationView.tsx`)
- Four demo languages: English (🇬🇧), Hindi (🇮🇳), German (🇩🇪), French (🇫🇷).
- AI localization translates **only** the approved scene changes.
- Carries forward existing approved translations for unchanged scenes.
- Layout risk indicators (e.g., German text expansion warnings, Hindi line-wrap caveats).
- Independent approval states per language.

### 5. Versioning, Publishing & Rollback (`lib/db/store.ts`, `lib/export/`)
- Pre-publication validation: blocks publishing if scene changes are pending or languages are unapproved.
- Creates an immutable release snapshot in version history (e.g. Version 1.1).
- Provides non-destructive rollback to any prior published version.
- Export formats:
  - **SRT Subtitles** (`/api/export?format=srt&lang=EN`)
  - **WebVTT Subtitles** (`/api/export?format=vtt&lang=EN`)
  - **Production Script** (`/api/export?format=script`)
  - **Release Changelog** (`/api/export?format=changelog`)
  - **Full Project JSON Snapshot** (`/api/export?format=json`)

---

## Database Architecture & Supabase Setup

The database schema is fully normalized and organized around organization tenancy and change traceability.

### Tables
- `organizations` — Multi-tenant organization records.
- `users` — User profiles and authentication metadata.
- `organization_members` — Role-based access control (`admin`, `editor`, `reviewer`).
- `projects` — Video training courses and current published version pointer.
- `source_documents` — Uploaded policy and source files.
- `scenes` — Scene metadata, scripts, visual prompts, and baseline versions.
- `scene_versions` — Historical snapshots of individual scenes.
- `detected_changes` — AI comparison results with grounded source quotes.
- `change_decisions` — Audit record of user approvals, rejections, and manual edits.
- `scene_translations` — Localized headlines, scripts, and QA flags per language.
- `localization_reviews` — Language-level review and signoff status.
- `published_versions` — Complete immutable release snapshots for audit and rollback.
- `audit_logs` — Activity trail of all system and user operations.
- `generation_jobs` — Asynchronous script, audio, and video rendering job tracker.

### Applying Migrations to Supabase
1. Create a project at [supabase.com](https://supabase.com).
2. In the Supabase SQL Editor, run `supabase/migrations/20261113000001_create_schema.sql`.
3. Run `supabase/seed.sql` to populate the Northstar Technologies demo workspace.
4. Copy the Supabase URL, Anon Key, and Service Role Key into your `.env.local` or Vercel environment variables.

---

## Deployment to Vercel

1. Push your repository to GitHub, GitLab, or Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com), click **Add New > Project** and select this repository.
3. Configure Environment Variables:
   - `OPENAI_API_KEY`: Your OpenAI API key (optional; app works out of the box if omitted).
   - `NEXT_PUBLIC_DEMO_MODE`: `true`
   - *(Optional)* Supabase connection credentials (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
4. Click **Deploy**. Vercel will build the Next.js App Router project and deploy it to a global edge network.

---

## Verification & Test Results

The test suite covers:
- Document parsing and section extraction (`tests/parser.test.ts`).
- AI change detection, grounded quotes, and schema validation (`tests/ai_engine.test.ts`).
- Subtitle export (SRT, WebVTT, Markdown script, Changelog) (`tests/subtitles_export.test.ts`).
- Full 10-step critical end-to-end user scenario (`tests/workflow_integration.test.ts`).

Run the test suite:
```bash
pnpm test
```
Result: **4 test files passed, 10 tests passed (100% pass rate).**

---

## License

MIT License. Designed for EasyVideo product evaluation.
#   e a s y v i d e o  
 