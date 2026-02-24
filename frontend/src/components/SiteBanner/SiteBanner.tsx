const SITES = [
  { name: 'YouTube', icon: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=32' },
  { name: 'Vimeo', icon: 'https://www.google.com/s2/favicons?domain=vimeo.com&sz=32' },
  { name: 'Dailymotion', icon: 'https://www.google.com/s2/favicons?domain=dailymotion.com&sz=32' },
  { name: 'Twitch', icon: 'https://www.google.com/s2/favicons?domain=twitch.tv&sz=32' },
  { name: 'SoundCloud', icon: 'https://www.google.com/s2/favicons?domain=soundcloud.com&sz=32' },
  { name: 'Facebook', icon: 'https://www.google.com/s2/favicons?domain=facebook.com&sz=32' },
  { name: 'Instagram', icon: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=32' },
  { name: 'TikTok', icon: 'https://www.google.com/s2/favicons?domain=tiktok.com&sz=32' },
  { name: 'Twitter/X', icon: 'https://www.google.com/s2/favicons?domain=x.com&sz=32' },
  { name: 'Reddit', icon: 'https://www.google.com/s2/favicons?domain=reddit.com&sz=32' },
  { name: 'Bilibili', icon: 'https://www.google.com/s2/favicons?domain=bilibili.com&sz=32' },
  { name: 'Bandcamp', icon: 'https://www.google.com/s2/favicons?domain=bandcamp.com&sz=32' },
  { name: 'Mixcloud', icon: 'https://www.google.com/s2/favicons?domain=mixcloud.com&sz=32' },
  { name: 'Rumble', icon: 'https://www.google.com/s2/favicons?domain=rumble.com&sz=32' },
  { name: 'Crunchyroll', icon: 'https://www.google.com/s2/favicons?domain=crunchyroll.com&sz=32' },
  { name: 'NBC', icon: 'https://www.google.com/s2/favicons?domain=nbc.com&sz=32' },
  { name: 'BBC', icon: 'https://www.google.com/s2/favicons?domain=bbc.co.uk&sz=32' },
  { name: 'CNN', icon: 'https://www.google.com/s2/favicons?domain=cnn.com&sz=32' },
  { name: 'TED', icon: 'https://www.google.com/s2/favicons?domain=ted.com&sz=32' },
  { name: 'Udemy', icon: 'https://www.google.com/s2/favicons?domain=udemy.com&sz=32' },
]

export default function SiteBanner() {
  // Double the list for seamless loop
  const items = [...SITES, ...SITES]

  return (
    <div className="relative overflow-hidden py-3" aria-hidden="true">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-zinc-50 to-transparent dark:from-zinc-950 z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-zinc-50 to-transparent dark:from-zinc-950 z-10 pointer-events-none" />

      {/* Scrolling track */}
      <div
        className="flex gap-6 w-max"
        style={{ animation: 'marquee 40s linear infinite' }}
      >
        {items.map((site, i) => (
          <div
            key={`${site.name}-${i}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100/80 dark:bg-zinc-800/50 shrink-0"
          >
            <img
              src={site.icon}
              alt=""
              className="w-4 h-4 rounded-sm"
              loading="lazy"
            />
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
              {site.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
