import type { PlaylistConfig } from '../types/playlist'

/**
 * Central configuration — change only this file for a new playlist page.
 *
 * 1. Paste your YouTube Music playlist URL into `youtubePlaylistUrl`
 * 2. Moon / sun backgrounds are toggled from the top-right button
 */
export const playlistConfig: PlaylistConfig = {
  youtubePlaylistUrl:
    'https://music.youtube.com/playlist?list=PLM1--p4myXtE',

  backgroundImage: '/backgrounds/bg-moon.png',

  /** [0] = moon mode, [1] = sun mode */
  backgroundImages: [
    '/backgrounds/bg-moon.png',
    '/backgrounds/bg-sun.png',
  ],

  showOpenButton: true,
}
