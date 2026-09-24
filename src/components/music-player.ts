/**
 * Background-music player driven by the YouTube IFrame API.
 *
 * Browsers block autoplay *with sound*, but allow autoplay while muted, so the
 * track starts muted-and-playing on load; the user unmutes / pauses via the
 * controls in the sidebar. The YouTube player is rendered off-screen; only our
 * own controls are visible.
 */

import { SIDEBAR } from "../services/data/sidebar.js";

// Which video/playlist plays is set in src/content/sidebar.json ("music").
const YT_VIDEO_ID = SIDEBAR.music.videoId;
const YT_PLAYLIST_ID = SIDEBAR.music.playlistId;

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  mute(): void;
  unMute(): void;
  setVolume(v: number): void;
  getVideoData(): { title: string; author: string; video_id: string };
}

let player: YTPlayer | null = null;
let ready = false;
let playing = true; // we autoplay on load
let muted = true; // ...but muted, per browser autoplay rules
let title = "Loading…";
let onChange: ((s: MusicState) => void) | null = null;

export interface MusicState {
  playing: boolean;
  muted: boolean;
  title: string;
}

function emit(): void {
  onChange?.({ playing, muted, title });
}

/** Inject the YouTube IFrame API script once and build the hidden player. */
export function initMusic(): void {
  if (document.getElementById("yt-music-host")) return;

  const host = document.createElement("div");
  host.id = "yt-music-host";
  // Kept in the DOM (required for playback) but out of sight.
  host.style.cssText =
    "position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;overflow:hidden;";
  const mount = document.createElement("div");
  mount.id = "yt-music-mount";
  host.appendChild(mount);
  document.body.appendChild(host);

  const boot = () => {
    // @ts-expect-error - YT is provided by the injected script.
    player = new YT.Player("yt-music-mount", {
      videoId: YT_VIDEO_ID,
      playerVars: {
        autoplay: 1,
        controls: 0,
        mute: 1,
        loop: 1,
        // A single-video "playlist" makes loop work; the real list also loops.
        list: YT_PLAYLIST_ID,
        listType: "playlist",
      },
      events: {
        onReady: () => {
          ready = true;
          player?.setVolume(35);
          player?.mute();
          player?.playVideo();
          refreshTitle();
          emit();
        },
        // Title metadata can land a beat after onReady; re-read on each change.
        onStateChange: () => refreshTitle(),
      },
    });
  };

  armAutoUnmute();

  // @ts-expect-error - runtime feature detection for the global.
  if (window.YT && window.YT.Player) {
    boot();
  } else {
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    // @ts-expect-error - YouTube calls this global when the API is ready.
    window.onYouTubeIframeAPIReady = boot;
  }
}

/**
 * Unmute on the visitor's first interaction with the page. Autoplay must start
 * muted, but a real user gesture (click / key / touch / scroll) lets us turn
 * the sound on without them hunting for the mute button.
 */
function armAutoUnmute(): void {
  const events = ["pointerdown", "keydown", "touchstart", "scroll"] as const;
  const handler = () => {
    if (muted) {
      muted = false;
      if (ready && player) player.unMute();
      emit();
    }
    for (const e of events) window.removeEventListener(e, handler);
  };
  for (const e of events) {
    window.addEventListener(e, handler, { once: false, passive: true });
  }
}

/** Pull the current video's title from the player and notify listeners. */
function refreshTitle(): void {
  const t = player?.getVideoData()?.title;
  if (t && t !== title) {
    title = t;
    emit();
  }
}

/** Toggle play / pause. */
export function togglePlay(): void {
  playing = !playing;
  if (ready && player) {
    if (playing) player.playVideo();
    else player.pauseVideo();
  }
  emit();
}

/** Toggle mute / unmute. */
export function toggleMute(): void {
  muted = !muted;
  if (ready && player) {
    if (muted) player.mute();
    else player.unMute();
  }
  emit();
}

/** Register a callback to reflect play/mute state in the UI. */
export function onMusicChange(cb: (s: MusicState) => void): void {
  onChange = cb;
}
