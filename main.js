async function loadManifest() {
  const versionLabel = document.getElementById("version-label");
  const releaseNote = document.getElementById("release-note");
  const downloadMac = document.getElementById("download-mac");
  const status = document.getElementById("download-status");

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
    if (mac?.path && downloadMac) {
      downloadMac.href = mac.path;
      downloadMac.setAttribute("download", mac.filename || "");
      if (status) {
        status.textContent = mac.label || "ダウンロードできます。";
        status.classList.add("is-ready");
      }
    } else if (status) {
      status.textContent = "Mac 用ファイルがまだありません。アプリ側で npm run publish:desktop を実行してください。";
      status.classList.add("is-missing");
    }
  } catch {
    if (status) {
      status.textContent =
        "配布ファイルがまだありません。アプリ側で npm run publish:desktop を実行してください。";
      status.classList.add("is-missing");
    }
  }
}

void loadManifest();
