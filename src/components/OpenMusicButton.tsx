interface OpenButtonProps {
  href: string
  className?: string
}

export function OpenMusicButton({ href, className = '' }: OpenButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`glass inline-flex items-center gap-2.5 rounded-full px-4 py-3 text-sm font-medium text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)] transition hover:scale-[1.03] hover:bg-white/10 ${className}`}
      aria-label="Open playlist in YouTube Music"
      title="Open YouTube Music"
    >
      <span>Open Source</span>
    </a>
  )
}
