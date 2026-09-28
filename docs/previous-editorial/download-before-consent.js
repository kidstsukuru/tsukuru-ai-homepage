function detectOs() {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod|android/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'other';
  if (ua.includes('win')) return 'win';
  if (ua.includes('mac')) return 'mac';
  return 'other';
}

async function loadManifest() {
  const status = document.getElementById('download-status');
  try {
    const response = await fetch('./downloads/manifest.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`MANIFEST_HTTP_${response.status}`);
    const manifest = await response.json();
    if (manifest.version) document.getElementById('version-label').textContent = `v${manifest.version}`;
    if (manifest.note) document.getElementById('release-note').textContent = manifest.note;
    const os = detectOs();
    let readyCount = 0;
    for (const platform of ['mac', 'win']) {
      const button = document.getElementById(`download-${platform}`);
      const path = manifest.files?.[platform]?.path;
      let url = null;
      try {
        if (typeof path === 'string' && path.trim()) url = new URL(path, window.location.href);
      } catch {
        console.warn('[DOWNLOAD_URL_INVALID]', { platform });
      }
      if (url && ['http:', 'https:'].includes(url.protocol)) {
        button.href = url.href;
        button.removeAttribute('aria-disabled');
        button.classList.remove('is-missing');
        button.classList.toggle('is-preferred', platform === os);
        readyCount += 1;
      } else {
        button.removeAttribute('href');
        button.setAttribute('aria-disabled', 'true');
        button.classList.add('is-missing');
        button.querySelector('small').textContent = 'ただいま準備中です';
      }
    }
    status.textContent = readyCount === 0 ? '配布ファイルはただいま準備中です。' : os === 'other' ? 'アプリはMac・Windowsのパソコンからダウンロードしてください。' : `${os === 'mac' ? 'Mac' : 'Windows'}をお使いの方は、対応するボタンを選んでください。`;
  } catch (error) {
    console.warn('[DOWNLOAD_MANIFEST_UNAVAILABLE]', error);
    status.textContent = '最新の配布情報を確認できませんでした。表示中のバージョン、またはFAQのリリース情報をご確認ください。';
  }
}


loadManifest();
