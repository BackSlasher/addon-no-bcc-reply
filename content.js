(() => {
  const LABEL_NAME = "Reply Guard";
  const GUARD_ATTR = "data-reply-guard";
  const PROCESSED_ATTR = "data-reply-guard-processed";

  function hasGuardLabel(container) {
    // Gmail label chips are div.hN[role="button"] with an aria-label like
    // "Search for all messages with label <name>"
    const labels = container.querySelectorAll('div.hN[role="button"]');
    for (const label of labels) {
      const aria = label.getAttribute("aria-label") || "";
      if (aria.includes(LABEL_NAME)) return true;
      if (label.textContent.trim() === LABEL_NAME) return true;
    }
    return false;
  }

  function createCover(target) {
    if (target.querySelector(".reply-guard-cover")) return;

    const isIconButton = target.tagName === "BUTTON";
    const cover = document.createElement("div");
    cover.className = "reply-guard-cover";
    cover.textContent = isIconButton ? "\u{1F512}" : "\u{1F512} Guarded";
    cover.title = "This conversation is guarded. Click to reveal.";

    cover.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      cover.remove();
    });

    target.style.position = "relative";
    target.appendChild(cover);
  }

  function findReplyButtons(container) {
    const buttons = [];

    // Icon buttons (top-right area)
    container.querySelectorAll(
      'button[aria-label="Reply"], button[aria-label="Reply all"]'
    ).forEach((btn) => buttons.push(btn));

    // Bottom text buttons (span[role="link"] with Reply/Reply all text)
    container.querySelectorAll('span[role="link"]').forEach((span) => {
      const text = span.textContent.trim();
      if (text === "Reply" || text === "Reply all") {
        buttons.push(span);
      }
    });

    return buttons;
  }

  function processMessages() {
    // The label chip lives on the conversation view, not per-message.
    // Walk up from role="list" (message list) to find the label chip,
    // then guard all reply buttons within.
    const messageLists = document.querySelectorAll('[role="list"]');

    for (const list of messageLists) {
      // Check ancestors for the label chip
      let container = list.parentElement;
      let found = false;
      for (let i = 0; i < 10 && container; i++) {
        if (hasGuardLabel(container)) {
          found = true;
          break;
        }
        container = container.parentElement;
      }
      if (!found) continue;

      // Guard reply buttons in individual messages
      const messages = list.querySelectorAll('[role="listitem"]');
      for (const msg of messages) {
        if (msg.hasAttribute(PROCESSED_ATTR)) continue;
        msg.setAttribute(PROCESSED_ATTR, "true");
        msg.setAttribute(GUARD_ATTR, "true");

        const replyButtons = findReplyButtons(msg);
        for (const btn of replyButtons) {
          createCover(btn);
        }
      }
    }

    // Bottom reply buttons live outside the listitem — walk up from
    // guarded messages to find them
    const guardedMessages = document.querySelectorAll(
      `[role="listitem"][${GUARD_ATTR}]`
    );
    for (const msg of guardedMessages) {
      let ancestor = msg.parentElement;
      for (let i = 0; i < 5 && ancestor; i++) {
        const links = ancestor.querySelectorAll('span[role="link"]');
        for (const link of links) {
          const text = link.textContent.trim();
          if (
            (text === "Reply" || text === "Reply all") &&
            !link.querySelector(".reply-guard-cover")
          ) {
            createCover(link);
          }
        }
        if (links.length > 0) break;
        ancestor = ancestor.parentElement;
      }
    }
  }

  // Debounced observer
  let timeout;
  const observer = new MutationObserver(() => {
    clearTimeout(timeout);
    timeout = setTimeout(processMessages, 300);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Initial scan
  processMessages();
})();
