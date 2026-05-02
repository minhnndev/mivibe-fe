# Studio — AI Web Design Landing + LUT Admin

Monorepo gồm:
- **`/`** — Landing page marketing (React + Vite + Tailwind + Framer Motion)
- **`/admin`** — LUT Management Admin (CRUD + WebGL preview + Supabase sync + mobile manifest export)

---

## Quick Start

```bash
npm install
cp .env.example .env
# Điền VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY vào .env

npm run dev
# Landing:  http://localhost:5173/
# Admin:    http://localhost:5173/admin

npm run build
```

---

## Supabase Setup — Chạy SQL này trong Supabase SQL Editor

```sql
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE luts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  filename TEXT NOT NULL UNIQUE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_free BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 0,
  preview_url TEXT,
  download_url TEXT,
  intensity FLOAT DEFAULT 1.0,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE luts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (true);
CREATE POLICY "public_read_active_luts" ON luts FOR SELECT USING (is_active = true);
CREATE POLICY "admin_all_categories" ON categories FOR ALL USING (true);
CREATE POLICY "admin_all_luts" ON luts FOR ALL USING (true);
```

---

## Cau truc Project

```
studio-landing/
├── public/
│   └── luts-cube/          <- File .cube LUTs (them LUT moi vao day)
├── src/
│   ├── components/         <- Landing page sections
│   └── admin/              <- LUT Admin dashboard
│       ├── AdminApp.jsx
│       ├── store.js         <- Data layer (localStorage + Supabase)
│       ├── supabase.js      <- Supabase client
│       ├── lutEngine.js     <- .cube parser + Canvas preview renderer
│       └── components/
├── .env.example
└── README.md
```

---

## Mobile Integration

### Option 1: Manifest JSON
Export tu Admin -> "Export Manifest" -> upload len CDN -> mobile poll URL

### Option 2: Supabase REST
```
GET https://your-project.supabase.co/rest/v1/luts
  ?is_active=eq.true&select=*,categories(*)
  -H "apikey: your-anon-key"
```

---

## Them LUT moi

1. Copy .cube vao `public/luts-cube/`
2. Them filename vao `KNOWN_CUBE_FILES` trong `src/admin/store.js`
3. Vao /admin -> Add LUT
