interface PlaylistHeaderProps {
  name: string
  ownerName: string
  description?: string
}

export function PlaylistHeader({
  name,
  ownerName,
  description,
}: PlaylistHeaderProps) {
  return (
    <header className="animate-fade-in max-w-xl text-center md:text-right">
      <p className="mb-3 text-[0.7rem] font-medium tracking-[0.28em] text-white/55 uppercase">
        Spotify Playlist
      </p>
      <h1 className="font-display text-balance text-4xl leading-[1.1] font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl">
        {name}
      </h1>
      <p className="mt-4 text-sm text-white/70 sm:text-base">
        by <span className="text-white/90">{ownerName}</span>
      </p>
      {description ? (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-white/55 sm:text-[0.95rem]">
          {description}
        </p>
      ) : null}
    </header>
  )
}
