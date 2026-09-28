# Release privacy review

Review date: 2026-09-28. Scope: userscript version 1.9.8 and the exact files in this release directory.

## Findings

- No embedded personal email, username, home-directory path, conversation identifier, credential, private key, wallpaper payload, or account export was found in the script.
- No outbound request implementation (`fetch`, XMLHttpRequest, WebSocket, sendBeacon, or userscript network API), remote dependency, CSS resource URL, or dynamic code loader was found.
- Media sources are local object URLs created from user-selected files. Storage is limited to the wallpaper IndexedDB, including the previous-video backup described in README.
- DOM text is inspected locally for appearance-related matching. This is not a promise that the script cannot access page text: it runs inside the page context.
- Release files were selected explicitly. No old repository history, diagnostic outputs, AI conversation records, original wallpaper files, or environment files are included. One historical preview image is included after visual and metadata review; it shows the themed start page without email addresses or chat messages.

## Limits

This is source review and pattern scanning, not a penetration test or a guarantee of zero risk. It does not audit ChatGPT itself, the browser, the userscript manager, other extensions, or future code changes. No new visual regression run was performed for this publication.

## Historical preview import

The prior project preview is reused unchanged as `preview.png`. Its visible content and PNG metadata were reviewed: no email address, credentials, or chat transcript was found. The image shows a profile-initial icon and generic suggestion cards. Metadata contains image dimensions, color profile, resolution and a generic Screenshot comment, not an author identity or GPS location. The README labels it as an earlier-version demonstration. The latest script remains byte-for-byte unchanged.
