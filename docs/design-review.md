# 宇宙デザインの評価記録 — 2026-09-27

## 方針
深いネイビーと控えめな青い光を背景に、制作イメージと作品を主役にする。
通常ゴシック・整列した余白・日本語の操作ボタンに変更し、絵本風の幼さを解消。
ヒーローの制作画面は説明用デモであり、実アプリのスクリーンショットではないことを明記。

## 評価体制と改善
- デザイン担当: ソースとPCヒーロー・作品ギャラリー・390pxモバイルの通常スクリーンショットを目視レビュー。
- UX担当: UIとARIAの整合、文字サイズ、manifest異常系、制作デモの状態管理を独立レビュー。
- 実装担当: ブラウザ実操作、レスポンシブ表示、画像読み込みとコンソールを検証。

指摘により、ヒーロー上部を圧縮、制作イメージの会話文字を拡大、操作ボタンを日本語化。
クイズ/ポートフォリオのCTA文字を白に、ポートフォリオ初期背景を淡色に修正。
最終目視評価では追加の必須修正なし。

## 検証
- PCと390px、320pxのレスポンシブ表示。横スクロールなし。
- ゲームの星3つ収集・再プレイ、クイズ正誤、ポートフォリオ色変更、Escで閉じる。
- 色/星/夜の独立トグル、組合せ、ARIA同期、全リセットとライブ状態通知。
- 不正URL1件、配布両方欠落、javascript URL禁止と相対URL、通信失敗時の既存リンク保持をNode vm mockで検証。
- manifestからのバージョン/配布リンク表示。
- node --check main.js、git diff --check。
- 画像は内蔵image_genで生成。透過惑星はWebP化でalphaを維持し約184KBへ軽量化。

## 制約
公開サイトへのデプロイは未実施。制作画面はデモで、AI接続は行わない。
ブラウザの全ページスクリーンショット機能には合成不具合があり、通常viewport画像で目視確認した。

## 2026-09-28 — Editorial / real product capture
- Reference direction: Antigravity, Claude, Cursor. Off-white, restrained green, large typography, generous space. Orbit details remain subtle.
- Educational narrative: imitation → personal choices → value for others; described as educational values, not an implemented curriculum.
- Actual installed `/Applications/TsukuruAI.app` displayed `docs/capture-project`. Screenshot is `assets/tsukuru-real-preview.png`; WebP is format compression only. No chat, generation result or success log was fabricated. Caption explicitly identifies the prepared sample.
- Clicked green in actual app and confirmed correct-answer feedback. Captured initial question for homepage.
- Design reviewer: no major issues; product image zoom link addresses small UI text.
- UX reviewer: no major flow/concept problems; fixed quiz symbol contrast with explicit light foreground.
- Verified desktop 1280px and real iframe layout at 390px / 320px (scrollWidth matches width). Saved desktop/mobile screenshots under docs/previews.
- Browser console showed no warnings/errors. Quiz answer and demo color/reset work. JavaScript syntax check passed.
- No deployment performed.

## 2026-09-28 — Superhuman / full layout revision
User explicitly requested a simpler layout organized around the education concept and becoming a 「超人」. Rebuilt HTML hierarchy and CSS rather than recoloring the preceding layout.
- Hero: oversized 「超人になる。」, immediate definition through self-directed creation for others, architectural ascending steps.
- Sequence: vision → 自立/守, 自走/破, 超人/離 → actual product screenshot → mentor → FAQ → download.
- Removed gallery and simulated demos; main.js retains manifest handling only. Previous HTML/JS saved under docs/previous-editorial; prior styles remain available but are not loaded.
- Design and UX reviewers found no major issues. Product context remains in product section; prioritizes requested philosophy-first direction.
- Desktop 1280px, mobile iframe 390/320px visually checked; heading punctuation visible at 320px, no horizontal overflow. All in-page anchor targets present, browser warning/error log empty, JS syntax valid.
- Screenshots: docs/previews/superhuman-desktop.png and superhuman-mobile.png. No production deployment.
