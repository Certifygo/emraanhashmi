# Spotify Playlist — GitHub Pages

A static, cinematic Spotify playlist page built with **React + Vite + TypeScript + Tailwind CSS**.

Playback uses Spotify’s **official embed player** (no client secret in the frontend, no backend required at runtime).

## Configure

Edit only:

`src/config/playlist.ts`

```ts
export const playlistConfig = {
  spotifyPlaylistUrl: 'https://open.spotify.com/playlist/YOUR_PLAYLIST_ID',
  backgroundImage: '/background.jpg',
  showTrackList: true,
  showSpotifyButton: true,
}
```

### Background image

Place your image at:

`public/background.jpg`

Or change `backgroundImage` to another file under `public/`.

### Optional full track list

oEmbed loads playlist title + artwork without secrets.

To also cache track titles/artists/durations for the side panel:

1. Create an app at [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Export credentials (local/CI only — never commit them):

```bash
export SPOTIFY_CLIENT_ID=your_client_id
export SPOTIFY_CLIENT_SECRET=your_client_secret
npm run sync-playlist
```

This writes `public/playlist-data.json` (safe to commit; contains public playlist metadata only).

## Local development

```bash
cd spotify-playlist
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

Output is in `dist/` and is ready for GitHub Pages (`base: './'`).

## Deploy to GitHub Pages

1. Create a GitHub repository and push this project.
2. In the repo: **Settings → Pages**
3. Build and deploy one of these ways:

### Option A — Deploy `dist` from `gh-pages` branch

```bash
npm run build
# commit/push source as usual, then publish dist:
npx gh-pages -d dist
```

Then set Pages source to the `gh-pages` branch.

### Option B — GitHub Actions (recommended)

Add `.github/workflows/deploy.yml` (included) and set Pages source to **GitHub Actions**.

Site URL will look like:

`https://USERNAME.github.io/REPOSITORY_NAME/`

## How playback works

- Metadata: Spotify **oEmbed** (no secret)
- Playback: Spotify **embed iframe** (official, works on static hosting)
- “Open Spotify” always opens the real playlist/track on Spotify
- Progress is **not** faked with timers; transport lives inside Spotify’s player
