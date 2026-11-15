# Release privacy review

Review date: 2026-11-15. Scope: version 1.9.19 code and release documentation only.

- Based on independently saved 1.9.18 source; original script body and storage keys preserved. Appended a CSS-only native footer fix scoped to existing image/video wallpaper elements.
- No embedded private contact data, credentials, browser exports, wallpaper payloads, conversation IDs, or local home paths found by source pattern review.
- New HTTPS metadata points to this public repository. Tampermonkey may contact GitHub for version checks and script download. No telemetry or outbound request API was added to the script.
- Existing local IndexedDB media and localStorage preference behavior retained. Embedded SETTINGS remain source defaults, not a verified export of any installed instance.
- JavaScript compilation passed. Live installation, visual regression, update fetching in Tampermonkey, and actual saved wallpaper restoration have not been verified.
- Existing preview.png retained unchanged; historical preview review is preserved in Git history.

This is bounded source review, not a security guarantee. Browser/site/extension behavior and future updates are outside this review.
