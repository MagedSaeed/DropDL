const SITES = [
  { name: 'YouTube', url: 'https://youtube.com', icon: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=32' },
  { name: 'Vimeo', url: 'https://vimeo.com', icon: 'https://www.google.com/s2/favicons?domain=vimeo.com&sz=32' },
  { name: 'Dailymotion', url: 'https://dailymotion.com', icon: 'https://www.google.com/s2/favicons?domain=dailymotion.com&sz=32' },
  { name: 'Twitch', url: 'https://twitch.tv', icon: 'https://www.google.com/s2/favicons?domain=twitch.tv&sz=32' },
  { name: 'SoundCloud', url: 'https://soundcloud.com', icon: 'https://www.google.com/s2/favicons?domain=soundcloud.com&sz=32' },
  { name: 'Facebook', url: 'https://facebook.com', icon: 'https://www.google.com/s2/favicons?domain=facebook.com&sz=32' },
  { name: 'Instagram', url: 'https://instagram.com', icon: 'https://www.google.com/s2/favicons?domain=instagram.com&sz=32' },
  { name: 'TikTok', url: 'https://tiktok.com', icon: 'https://www.google.com/s2/favicons?domain=tiktok.com&sz=32' },
  { name: 'Twitter/X', url: 'https://x.com', icon: 'https://www.google.com/s2/favicons?domain=x.com&sz=32' },
  { name: 'Reddit', url: 'https://reddit.com', icon: 'https://www.google.com/s2/favicons?domain=reddit.com&sz=32' },
  { name: 'Bilibili', url: 'https://bilibili.com', icon: 'https://www.google.com/s2/favicons?domain=bilibili.com&sz=32' },
  { name: 'Bandcamp', url: 'https://bandcamp.com', icon: 'https://www.google.com/s2/favicons?domain=bandcamp.com&sz=32' },
  { name: 'Mixcloud', url: 'https://mixcloud.com', icon: 'https://www.google.com/s2/favicons?domain=mixcloud.com&sz=32' },
  { name: 'Rumble', url: 'https://rumble.com', icon: 'https://www.google.com/s2/favicons?domain=rumble.com&sz=32' },
  { name: 'Crunchyroll', url: 'https://crunchyroll.com', icon: 'https://www.google.com/s2/favicons?domain=crunchyroll.com&sz=32' },
  { name: 'NBC', url: 'https://nbc.com', icon: 'https://www.google.com/s2/favicons?domain=nbc.com&sz=32' },
  { name: 'BBC', url: 'https://bbc.co.uk', icon: 'https://www.google.com/s2/favicons?domain=bbc.co.uk&sz=32' },
  { name: 'CNN', url: 'https://cnn.com', icon: 'https://www.google.com/s2/favicons?domain=cnn.com&sz=32' },
  { name: 'TED', url: 'https://ted.com', icon: 'https://www.google.com/s2/favicons?domain=ted.com&sz=32' },
  { name: 'Udemy', url: 'https://udemy.com', icon: 'https://www.google.com/s2/favicons?domain=udemy.com&sz=32' },
]

export default function SiteBanner() {
  return (
    <div className="py-3 text-center">
      <div className="flex items-center justify-center flex-wrap gap-3 mb-2">
        {SITES.map((site) => (
          <a
            key={site.name}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            title={site.name}
            className="hover:opacity-100 transition-opacity"
          >
            <img
              src={site.icon}
              alt={site.name}
              className="w-4 h-4 grayscale opacity-50 dark:invert dark:opacity-40"
              loading="lazy"
            />
          </a>
        ))}
      </div>
      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Powered by{' '}
        <a
          href="https://github.com/yt-dlp/yt-dlp"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-zinc-600 dark:hover:text-zinc-300"
          title="yt-dlp on GitHub"
        >
          yt-dlp
        </a>
        {' '}&middot;{' '}
        <a
          href="https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-zinc-600 dark:hover:text-zinc-300"
          title="View full list of supported sites"
        >
          1000+ supported sites
        </a>
      </p>
    </div>
  )
}
