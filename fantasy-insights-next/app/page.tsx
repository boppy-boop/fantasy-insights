export const dynamic = 'force-dynamic';

import AuthButton from "../components/AuthButton";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Fantasy Insights</h1>
        <p>Sign in to load your Yahoo league data.</p>
        <AuthButton />
      </div>
    </main>
  );
}
