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
    status.textContent = readyCount === 0 ? '配布ファイルはただいま準備中です。' : os === 'other' ? 'スマートフォン・タブレットでは作品サンプルを体験できます。アプリはMac・Windowsのパソコンからダウンロードしてください。' : `${os === 'mac' ? 'Mac' : 'Windows'}をお使いの方は、対応するボタンを選んでください。`;
  } catch (error) {
    console.warn('[DOWNLOAD_MANIFEST_UNAVAILABLE]', error);
    status.textContent = '最新の配布情報を確認できませんでした。表示中のバージョン、またはFAQのリリース情報をご確認ください。';
  }
}

const scene = document.getElementById('demo-scene');
const worldControls = [
  { id: 'grow-world', className: 'grown', description: '星を増やしました' },
  { id: 'color-world', className: 'recolored', description: '色を変えました' },
  { id: 'night-world', className: 'night', description: '夜にしました' },
];
function updateWorld() {
  scene.querySelector('.scene-stars').textContent = scene.classList.contains('grown')
    ? '✦　✧　★　✦　✧　✦　✧　✦　★' : '✦　　✧　　✦';
  const changes = [];
  worldControls.forEach(control => {
    const active = scene.classList.contains(control.className);
    document.getElementById(control.id).setAttribute('aria-pressed', String(active));
    if (active) changes.push(control.description);
  });
  document.getElementById('scene-caption').textContent = changes.length
    ? `${changes.join('。')}。次はどう変える？` : '小さな世界から、つくってみよう。';
}
worldControls.forEach(control => {
  document.getElementById(control.id).addEventListener('click', () => {
    scene.classList.toggle(control.className);
    updateWorld();
  });
});
document.getElementById('reset-world').addEventListener('click', () => {
  worldControls.forEach(control => scene.classList.remove(control.className));
  updateWorld();
});

const dialog = document.getElementById('sample-dialog');
const content = document.getElementById('sample-content');
const title = document.getElementById('sample-title');
function showGame() {
  title.textContent = '星を3つ集めよう！';
  content.innerHTML = '<p>星をクリック・タップして集めよう。キーボードならTabで選んでEnter。</p><div class="sample-game"><button class="collect-star" style="left:12%;top:52%" aria-label="１つ目の星を集める">★</button><button class="collect-star" style="left:43%;top:14%" aria-label="２つ目の星を集める">★</button><button class="collect-star" style="left:72%;top:47%" aria-label="３つ目の星を集める">★</button></div><p class="sample-feedback" role="status">集めた星：0 / 3</p><button class="idea-button" id="replay-game">もう一度遊ぶ ↺</button>';
  let count = 0;
  content.querySelectorAll('.collect-star').forEach(button => button.addEventListener('click', () => {
    button.disabled = true;
    button.textContent = '✓';
    count += 1;
    content.querySelector('.sample-feedback').textContent = count === 3 ? 'クリア！ 3つの星を集めました。' : `集めた星：${count} / 3`;
  }));
  document.getElementById('replay-game').addEventListener('click', () => { showGame(); content.querySelector('button').focus(); });
}
function showQuiz() {
  title.textContent = 'デザインクイズ';
  content.innerHTML = '<p>青と黄色の絵の具を混ぜると、何色になる？</p><div class="quiz-colors" aria-hidden="true"><span style="color:#6ea6ff">●</span> ＋ <span style="color:#ffd667">●</span> ＝ ？</div><div class="answer-buttons"><button data-answer="yes">緑</button><button data-answer="no">紫</button></div><p class="sample-feedback" role="status">答えを選んでみよう。</p>';
  content.querySelectorAll('[data-answer]').forEach(button => button.addEventListener('click', () => {
    content.querySelector('.sample-feedback').textContent = button.dataset.answer === 'yes'
      ? '正解！ 青と黄色の絵の具を混ぜると緑になります。次は自分のクイズをつくってみよう。'
      : 'もう一度！ 紫は青と赤の絵の具を混ぜるとできる色です。';
  }));
}
function showProfile() {
  title.textContent = '自分らしいポートフォリオに';
  content.innerHTML = '<div class="profile-demo"><span aria-hidden="true">✦</span><h3>MY CREATIVE SPACE</h3><p>ゲーム、デザイン、好きなこと。<br>つくった作品を、ここから届けよう。</p></div><div class="color-buttons"><button data-color="#e9dff1" aria-pressed="true">ラベンダー</button><button data-color="#c9eddd" aria-pressed="false">ミント</button><button data-color="#ffe6a0" aria-pressed="false">サンド</button></div><p class="sample-feedback" role="status">今はラベンダー。好きな色を選んでみよう。</p>';
  content.querySelectorAll('[data-color]').forEach(button => button.addEventListener('click', () => {
    content.querySelector('.profile-demo').style.background = button.dataset.color;
    content.querySelectorAll('[data-color]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    content.querySelector('.sample-feedback').textContent = `${button.textContent}のページに変わりました。`;
  }));
}
document.querySelectorAll('[data-demo]').forEach(button => button.addEventListener('click', () => {
  ({ game: showGame, quiz: showQuiz, profile: showProfile })[button.dataset.demo]();
  dialog.showModal();
}));
document.getElementById('close-dialog').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const rect = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close();
});
void loadManifest();
