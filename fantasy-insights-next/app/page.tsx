import AuthButton from "@/components/AuthButton" // or "./AuthButton" if you didn’t move it

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Fantasy Insights</h1>
        <p className="text-zinc-300">Sign in to load your Yahoo league data.</p>
        <div className="pt-2">
          <AuthButton />
        </div>
      </div>
    </main>
  )
}
