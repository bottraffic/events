'use client';

// Lightweight self-hosted telemetry: reports JS errors / events to our backend.
const ENDPOINT = '/v1/telemetry'; // nginx proxies same-origin

function deviceId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('simcha_device');
  if (!id) { id = 'web-' + Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem('simcha_device', id); }
  return id;
}

export function report(type: 'crash' | 'error' | 'event', message?: string, stack?: string) {
  try {
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        type, platform: 'web', message: (message ?? '').slice(0, 2000), stack: stack?.slice(0, 6000),
        appVersion: 'web', deviceId: deviceId(),
        url: typeof location !== 'undefined' ? location.pathname : undefined,
      }),
    }).catch(() => {});
  } catch {}
}

let installed = false;
export function initTelemetry() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  window.addEventListener('error', (e) => report('error', e.message, (e.error as any)?.stack));
  window.addEventListener('unhandledrejection', (e: any) => report('error', 'unhandledrejection: ' + (e.reason?.message ?? String(e.reason)), e.reason?.stack));
  report('event', 'app_open');
}
