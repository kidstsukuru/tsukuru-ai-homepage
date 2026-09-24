const REDUCE_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function detectOs() {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "win";
  if (ua.includes("mac")) return "mac";
  return "other";
}

async function loadManifest() {
  const versionLabel = document.getElementById("version-label");
  const releaseNote = document.getElementById("release-note");
  const downloadMac = document.getElementById("download-mac");
  const downloadWin = document.getElementById("download-win");
  const status = document.getElementById("download-status");
  const os = detectOs();

  try {
    const response = await fetch("./downloads/manifest.json", { cache: "no-store" });
    if (!response.ok) throw new Error("manifest missing");
    const manifest = await response.json();

    if (manifest.version && versionLabel) {
      versionLabel.textContent = `v${manifest.version}`;
    }
    if (manifest.note && releaseNote) {
      releaseNote.textContent = manifest.note;
    }

    const mac = manifest.files?.mac;
    const win = manifest.files?.win;
    let readyCount = 0;

    if (mac?.path && downloadMac) {
      downloadMac.href = mac.path;
      readyCount += 1;
    } else if (downloadMac) {
      downloadMac.classList.add("is-missing");
    }

    if (win?.path && downloadWin) {
      downloadWin.href = win.path;
      readyCount += 1;
    } else if (downloadWin) {
      downloadWin.classList.add("is-missing");
    }

    if (os === "mac" && downloadMac && !downloadMac.classList.contains("is-missing")) {
      downloadMac.classList.add("is-preferred");
    } else if (os === "win" && downloadWin && !downloadWin.classList.contains("is-missing")) {
      downloadWin.classList.add("is-preferred");
    } else if (downloadMac && !downloadMac.classList.contains("is-missing")) {
      downloadMac.classList.add("is-preferred");
    }

      if (status) {
        if (readyCount === 0) {
          status.textContent =
            "配布ファイルがまだありません。アプリ側で npm run publish:desktop を実行してください。";
          status.classList.add("is-missing");
        } else {
          status.textContent =
            os === "win"
              ? "Windows 向けを強調しています。セットアップを実行してインストールしてください。"
              : os === "mac"
                ? "Mac 向けを強調しています。Applications へドラッグ後、「壊れている」と出たら xattr -cr /Applications/ツクルAI.app を実行してください。"
                : "Mac は DMG、Windows はセットアップです。";
          status.classList.add("is-ready");
        }
      }
  } catch {
    if (status) {
      status.textContent =
        "配布ファイルがまだありません。アプリ側で npm run publish:desktop を実行してください。";
      status.classList.add("is-missing");
    }
  }
}

function setupReveal() {
  const nodes = [...document.querySelectorAll(".reveal")];
  if (REDUCE_MOTION) {
    nodes.forEach((node) => node.classList.add("is-in"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
  );

  nodes.forEach((node, index) => {
    node.style.transitionDelay = `${Math.min(index * 0.04, 0.28)}s`;
    observer.observe(node);
  });
}

function setupParallax() {
  if (REDUCE_MOTION) return;
  const orbs = [...document.querySelectorAll("[data-depth]")];
  let mx = 0;
  let my = 0;
  let cx = 0;
  let cy = 0;

  window.addEventListener(
    "pointermove",
    (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      mx = x;
      my = y;
    },
    { passive: true },
  );

  function tick() {
    cx += (mx - cx) * 0.06;
    cy += (my - cy) * 0.06;
    for (const orb of orbs) {
      const depth = Number(orb.getAttribute("data-depth") || 0.1);
      orb.style.transform = `translate3d(${cx * depth * -120}px, ${cy * depth * -80}px, 0)`;
    }
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function setupTilt() {
  if (REDUCE_MOTION) return;
  const cards = [...document.querySelectorAll("[data-tilt]")];

  for (const card of cards) {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(700px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-2px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });
  }
}

function setupCanvas() {
  const canvas = document.getElementById("stage");
  if (!(canvas instanceof HTMLCanvasElement) || REDUCE_MOTION) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const blocks = [];
  let w = 0;
  let h = 0;
  let t = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function seed() {
    blocks.length = 0;
    const count = Math.floor(Math.min(w, 1200) / 55);
    for (let i = 0; i < count; i += 1) {
      blocks.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: 8 + Math.random() * 18,
        speed: 0.15 + Math.random() * 0.45,
        phase: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.5 ? "31,94,255" : "0,163,196",
      });
    }
  }

  function draw() {
    t += 1;
    ctx.clearRect(0, 0, w, h);

    // soft grid
    ctx.strokeStyle = "rgba(13, 21, 32, 0.04)";
    ctx.lineWidth = 1;
    const gap = 56;
    const ox = (t * 0.15) % gap;
    for (let x = -gap + ox; x < w + gap; x += gap) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = -gap + ((t * 0.08) % gap); y < h + gap; y += gap) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    for (const block of blocks) {
      block.y -= block.speed;
      block.x += Math.sin(t * 0.01 + block.phase) * 0.25;
      if (block.y < -40) {
        block.y = h + 40;
        block.x = Math.random() * w;
      }

      const pulse = 0.35 + 0.35 * Math.sin(t * 0.03 + block.phase);
      ctx.fillStyle = `rgba(${block.hue}, ${pulse})`;
      ctx.fillRect(block.x, block.y, block.size, block.size * 0.7);
    }

    // connecting “build” path near center-right
    const pathX = w * 0.72;
    const pathY = h * 0.42;
    ctx.strokeStyle = "rgba(31, 94, 255, 0.18)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < 5; i += 1) {
      const px = pathX + Math.cos(t * 0.02 + i) * (40 + i * 18);
      const py = pathY + Math.sin(t * 0.025 + i * 0.8) * (24 + i * 10);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    requestAnimationFrame(draw);
  }

  resize();
  seed();
  draw();
  window.addEventListener("resize", () => {
    resize();
    seed();
  });
}

void loadManifest();
setupReveal();
setupParallax();
setupTilt();
setupCanvas();
