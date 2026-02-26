# BCC Reply Guard

A browser extension for Gmail that prevents accidental replies when you're BCC'd on an email.

When you're BCC'd, replying exposes that you received the email. This extension overlays a small cover on Reply and Reply All buttons. Click the cover to dismiss it, then reply normally.

## Install

### Chrome
1. Go to `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this directory

### Firefox
1. Go to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Select `manifest.json` from this directory

## How it works

- Content script runs on `mail.google.com`
- Watches for email messages via a MutationObserver
- Checks if the message header contains "bcc:" (indicating you were BCC'd)
- Overlays a cover on Reply / Reply All buttons
- Click the cover to dismiss it and access the button
