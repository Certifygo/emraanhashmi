interface ArtworkProps {
  src: string | null
  alt: string
}

export function Artwork({ src, alt }: ArtworkProps) {
  return (
    <div className="animate-rise-in group relative mx-auto w-full max-w-[min(72vw,420px)] md:mx-0 md:max-w-[min(38vw,460px)]">
      <div className="absolute -inset-6 rounded-[2rem] bg-black/30 blur-2xl transition duration-500 group-hover:bg-black/45" />
      <div className="relative overflow-hidden rounded-[1.6rem] shadow-[0_30px_80px_rgba(0,0,0,0.55)] ring-1 ring-white/15 transition duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_40px_90px_rgba(0,0,0,0.65)]">
        {src ? (
          <img
            src={src}
            alt={alt}
            className="aspect-square w-full object-cover"
            draggable={false}
          />
        ) : (
          <div
            className="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950"
            role="img"
            aria-label={alt}
          >
            <span className="text-sm tracking-widest text-white/40 uppercase">
              No artwork
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
