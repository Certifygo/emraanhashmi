interface StatusScreenProps {
  title: string
  message: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export function StatusScreen({
  title,
  message,
  actionLabel,
  actionHref,
  onAction,
}: StatusScreenProps) {
  return (
    <div className="flex min-h-dvh w-full items-center justify-center px-6">
      <div className="glass animate-rise-in max-w-md rounded-3xl px-8 py-10 text-center">
        <p className="text-[0.7rem] tracking-[0.25em] text-white/45 uppercase">
          Spotify
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-white">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/65">{message}</p>
        {actionLabel && (actionHref || onAction) ? (
          actionHref ? (
            <a
              href={actionHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex rounded-full bg-[#1db954] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#1ed760]"
            >
              {actionLabel}
            </a>
          ) : (
            <button
              type="button"
              onClick={onAction}
              className="mt-6 inline-flex rounded-full bg-[#1db954] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#1ed760]"
            >
              {actionLabel}
            </button>
          )
        ) : null}
      </div>
    </div>
  )
}
