function detectOs() {
  const ua = navigator.userAgent.toLowerCase();
  if (
    /iphone|ipad|ipod|android/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  ) {
    return "other";
  }
  if (ua.includes("win")) return "win";
  if (ua.includes("mac")) return "mac";
  return "other";
}

/** @type {Record<string, string>} */
let downloadUrls = {};

async function loadManifest() {
  const versionLabel = document.getElementById("version-label");
  const status = document.getElementById("download-status");
  const os = detectOs();

  try {
    const response = await fetch("./downloads/manifest.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`MANIFEST_HTTP_${response.status}`);
    const manifest = await response.json();

    if (manifest.version && versionLabel) {
      versionLabel.textContent = `v${manifest.version}`;
    }

    downloadUrls = {};
    let readyCount = 0;

    for (const platform of ["mac", "win"]) {
      const button = document.getElementById(`download-${platform}`);
      if (!button) continue;

      const path = manifest.files?.[platform]?.path;
      let url = null;
      try {
        if (typeof path === "string" && path.trim()) {
          url = new URL(path, window.location.href);
        }
      } catch {
        url = null;
      }

      if (url && ["http:", "https:"].includes(url.protocol)) {
        downloadUrls[platform] = url.href;
        button.classList.remove("is-missing");
        button.classList.toggle("is-preferred", platform === os);
        readyCount += 1;
      } else {
        delete downloadUrls[platform];
        button.classList.add("is-missing");
        button.classList.remove("is-preferred");
      }
    }

    updateConsentState();

    if (status && !hasConsent()) {
      if (readyCount === 0) {
        status.textContent = "配布ファイルはただいま準備中です。";
      } else if (os === "other") {
        status.textContent =
          "立場の選択と2つの確認後に、Mac / Windows 向けをダウンロードできます。";
      } else {
        status.textContent = "立場の選択と2つの確認後に、ダウンロードできます。";
      }
    }
  } catch (error) {
    console.warn("[DOWNLOAD_MANIFEST_UNAVAILABLE]", error);
    if (versionLabel) versionLabel.textContent = "配布情報を確認できません";
    if (status) {
      status.textContent =
        "最新の配布情報を確認できませんでした。しばらくしてから再度お試しください。";
    }
  }
}

function hasConsent() {
  const role = document.getElementById("adult-role");
  const adult = document.getElementById("confirm-adult");
  const terms = document.getElementById("confirm-terms");
  return Boolean(
    role instanceof HTMLSelectElement &&
      role.value &&
      adult instanceof HTMLInputElement &&
      adult.checked &&
      terms instanceof HTMLInputElement &&
      terms.checked,
  );
}

function updateConsentState() {
  const status = document.getElementById("download-status");
  const ready = hasConsent();

  for (const platform of ["mac", "win"]) {
    const button = document.getElementById(`download-${platform}`);
    if (!(button instanceof HTMLButtonElement)) continue;
    const hasUrl = Boolean(downloadUrls[platform]);
    button.disabled = !(ready && hasUrl);
  }

  if (!(status instanceof HTMLElement)) return;
  if (!ready) {
    status.textContent = "立場の選択と2つの確認後に、ダウンロードできます。";
    return;
  }

  const os = detectOs();
  if (Object.keys(downloadUrls).length === 0) {
    status.textContent = "配布ファイルはただいま準備中です。";
  } else if (os === "other") {
    status.textContent = "確認が完了しました。Mac / Windows のボタンから選んでください。";
  } else {
    status.textContent = `確認が完了しました。${
      os === "mac" ? "Mac" : "Windows"
    }向けが強調表示されています。`;
  }
}

function setupConsentForm() {
  const form = document.getElementById("download-form");
  if (!(form instanceof HTMLFormElement)) return;

  form.addEventListener("change", () => updateConsentState());
  form.addEventListener("input", () => updateConsentState());

  for (const platform of ["mac", "win"]) {
    const button = document.getElementById(`download-${platform}`);
    if (!(button instanceof HTMLButtonElement)) continue;
    button.addEventListener("click", () => {
      if (button.disabled) return;
      const url = downloadUrls[platform];
      if (!url) return;
      window.location.assign(url);
    });
  }
}

function setupImageDialog() {
  const dialog = document.getElementById("image-dialog");
  const expanded = document.getElementById("expanded-image");
  const caption = document.getElementById("image-caption");
  const closeBtn = document.getElementById("close-image");
  if (!(dialog instanceof HTMLDialogElement) || !(expanded instanceof HTMLImageElement)) {
    return;
  }

  document.querySelectorAll("[data-expand-src]").forEach((node) => {
    if (!(node instanceof HTMLElement)) return;
    node.addEventListener("click", () => {
      const src = node.getAttribute("data-expand-src");
      if (!src) return;
      expanded.src = src;
      expanded.alt = node.getAttribute("data-expand-alt") || "";
      if (caption) caption.textContent = node.getAttribute("data-expand-caption") || "";
      dialog.showModal();
    });
  });

  closeBtn?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

setupConsentForm();
setupImageDialog();
void loadManifest();
