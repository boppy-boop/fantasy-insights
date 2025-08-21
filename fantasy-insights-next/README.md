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

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Fantasy Insights – Setup Notes


## 1) Styling & Layout
- Uses **Tailwind v4** (already in your devDeps). No config required.
- The header/footer and ESPN-like accents live in `app/layout.tsx` and global CSS.


## 2) Auth & Greeting
- The landing (`app/page.tsx`) is a client component using `useSession()` from **next-auth** to greet users by first name and show a Yahoo sign-in CTA when logged out.
- Ensure your **Yahoo provider** is configured in `pages/api/auth/[...nextauth].ts` or `app/api/auth/[...nextauth]/route.ts` with `YAHOO_CLIENT_ID`, `YAHOO_CLIENT_SECRET`, and correct redirect.


## 3) Data Hooks
- `app/fantasy/page.tsx` calls `/api/yahoo/leagues`. Map your existing response shape to `LeagueSummary`.
- Add similar calls for matchups, standings, roster/injuries.


## 4) AI Storylines
- `lib/insights.ts` contains simple rule-based summaries you can replace with an LLM later. If you add OpenAI or another provider, call it server-side and cache results per week.


## 5) Next Steps
- Replace placeholders with real API handlers you already have under `app/api/yahoo/*`.
- Add charts (Recharts) for History. Install: `npm i recharts`.
- If you want server-rendered greetings instead, expose your `authOptions` and use `getServerSession(authOptions)` in a server component.