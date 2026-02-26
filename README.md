# BCC Reply Guard

A browser extension for Gmail that prevents accidental replies when you're BCC'd on an email.

When you're BCC'd, replying exposes that you received the email. This extension overlays a small cover on Reply and Reply All buttons. Click the cover to dismiss it, then reply normally.

## Install

### Chrome

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions`
3. Toggle **Developer mode** on (top-right corner)
4. Click **Load unpacked**
5. Select the folder containing this extension (the one with `manifest.json` in it)
6. Open Gmail — the extension is now active

To update: pull/download the latest version, then click the reload icon on the extension card in `chrome://extensions`.

> Note: Chrome will occasionally show a "Disable developer mode extensions" popup. Just dismiss it.

### Firefox

1. Download or clone this repository
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on...**
4. Select the `manifest.json` file inside the extension folder
5. Open Gmail — the extension is now active

> Note: Temporary add-ons in Firefox are removed when you close the browser. For a permanent install, the extension needs to be published on [addons.mozilla.org](https://addons.mozilla.org).

## How it works

- Runs a content script on `mail.google.com`
- Watches for email messages via a MutationObserver
- When a message header contains "bcc:", overlays a red cover on the Reply / Reply All buttons
- Click the cover to dismiss it, then use the button normally
