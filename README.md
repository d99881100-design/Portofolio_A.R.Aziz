This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Portfolio + Supabase overview

This project is built with Next.js, TypeScript, Tailwind CSS, and Supabase.

The app flow is:

Next.js → Supabase → PostgreSQL

### Supabase tables

- `public.projects`
  - `id` : bigint / serial
  - `slug` : text
  - `number` : text
  - `title` : text
  - `category` : text
  - `description` : text
  - `image` : text
  - `technologies` : text[]
  - `github_url` : text
  - `live_url` : text
  - `featured` : boolean
  - `color` : text
  - `created_at` : timestamptz

- `public.experience`
  - `id` : bigint / serial
  - `year` : text
  - `role` : text
  - `company` : text
  - `description` : text
  - `tools` : text[]

- `public.achievements`
  - `id` : bigint / serial
  - `title` : text
  - `year` : text
  - `level` : text
  - `description` : text

- `public.certificates`
  - `id` : bigint / serial
  - `title` : text
  - `issuer` : text
  - `year` : text
  - `image` : text
  - `link` : text

- `public.education`
  - `id` : bigint / serial
  - `year` : text
  - `school` : text
  - `major` : text
  - `description` : text

- `public.contact_messages`
  - `id` : bigint / serial
  - `name` : text
  - `email` : text
  - `message` : text
  - `created_at` : timestamptz

### Data sources

- Project data is now served from Supabase.
- Experience data is now served from Supabase.
- Achievement data is now served from Supabase.
- Certificate data is now served from Supabase.
- Education data is now served from Supabase.
- Contact form submissions are handled through the route `/api/contact` and inserted into `public.contact_messages`.

### Security notes

- RLS remains active.
- Public read access is used for portfolio data that is intentionally public.
- `public.contact_messages` accepts public insert only for contact submissions.
- No service role or secret key is used in frontend code.
- Environment variables are kept in `.env.local` and are not committed to the repository.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
