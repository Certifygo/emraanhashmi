interface LoadingScreenProps {
  message?: string
}

export function LoadingScreen({
  message = 'Loading playlist…',
}: LoadingScreenProps) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center px-6">
      <div className="glass animate-rise-in flex max-w-sm flex-col items-center gap-4 rounded-3xl px-8 py-10 text-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[#1db954]"
          aria-hidden
        />
        <p className="animate-pulse-soft text-sm text-white/75">{message}</p>
      </div>
    </div>
  )
}
