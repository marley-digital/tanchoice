# TANCHOICE LIMITED – Simply Organic Field Forms

Web-based replacement for Tanchoice Meat Factory’s paper workflow in Babati, Tanzania. Built with React + TypeScript + Vite, TailwindCSS, Supabase (Postgres + Auth + RLS), and client-side PDF/CSV exports.

## Features

- Email/password authentication via Supabase Auth (with automatic mock fallback if env vars are missing)
- Supplier management (CRUD, default paint marks)
- Daily trip form builder with dynamic supplier rows and totals
- Trip list + detail pages with PDF/print buttons
- Monthly/yearly supplier reports with date/region filters, drill-down views, CSV/PDF exports
- Future-ready `slaughter_results` table for payment tracking

## Tech Stack

| Layer        | Tools                                                                |
| ------------ | -------------------------------------------------------------------- |
| Frontend     | React 18, TypeScript, Vite, React Router 6, TailwindCSS              |
| State/Data   | Supabase JS client (with mock localStorage DB fallback)              |
| Auth         | Supabase email/password + mock session storage                       |
| PDFs & CSVs  | jsPDF + jspdf-autotable, custom CSV utility                          |
| Deployment   | Netlify static hosting (`npm run build`)                             |

## Getting Started

```bash
npm install
npm run dev
```

The dev server runs at `http://localhost:5173`.

### Environment Variables

Create `.env` (or use Netlify environment settings):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

If you omit these variables, the app automatically switches to **mock mode**: authentication, suppliers, trips, and reports are backed by localStorage so you can review the UI without hitting Supabase. Add the env vars later to talk to your live backend.

## Supabase Setup

1. Create a Supabase project.
2. In SQL Editor, run `supabase/schema.sql` from this repo to create tables, indexes, and RLS policies.
3. Enable email/password auth under Authentication → Providers.
4. Create a user (or enable signups) for your field team.

### Row Level Security

All tables (`suppliers`, `trips`, `trip_animals`, `slaughter_results`) have RLS enabled. Policies allow any authenticated Supabase user to read/write. Adjust policies if you need finer control later.

## Project Structure

```
src/
├── components/
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
├── lib/
│   ├── api.ts              # Supabase + mock persistence layer
│   ├── auth.ts             # Auth + mock session
│   ├── csv.ts              # CSV helpers
│   ├── pdf.ts              # jsPDF helpers
│   └── supabaseClient.ts
├── pages/
│   ├── Login.tsx
│   ├── Suppliers.tsx
│   ├── Trips.tsx
│   ├── TripForm.tsx
│   ├── TripDetail.tsx
│   ├── SupplierReports.tsx
│   └── SupplierDetailReport.tsx
├── types/
│   ├── index.ts
│   └── jspdf-autotable.d.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Deployment (Netlify)

1. `npm run build`
2. Deploy `dist/` (Netlify build command: `npm run build`, publish directory: `dist`)
3. Add env vars in Netlify dashboard (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
4. Optional: include `netlify.toml` (already in repo) to configure redirects for React Router

## Testing Checklist

- [ ] Login with Supabase credentials or mock mode
- [ ] Create/edit/delete suppliers
- [ ] Create a trip with multiple supplier rows (watch totals update)
- [ ] View trip detail, download/print PDF
- [ ] Generate supplier summaries, export CSV/PDF, drill into supplier detail
- [ ] Build succeeds locally (`npm run build`)

## Support & Next Steps

- Wire up `slaughter_results` for post-slaughter tracking and payments
- Add role-based access (e.g., driver vs admin)
- Integrate push notifications or SMS for supplier receipts

For questions, reach out to the Tanchoice tech team or update this repo with issues/PRs.

