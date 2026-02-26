(() => {
  const GUARD_ATTR = "data-bcc-guard";
  const PROCESSED_ATTR = "data-bcc-guard-processed";

  function isBccMessage(messageEl) {
    // Look for text containing "bcc:" in the message header area
    const walker = document.createTreeWalker(
      messageEl,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          return /\bbcc:/i.test(node.textContent)
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_REJECT;
        },
      }
    );
    return !!walker.nextNode();
  }

  function createCover(target) {
    if (target.querySelector(`.bcc-guard-cover`)) return;

    const cover = document.createElement("div");
    cover.className = "bcc-guard-cover";
    cover.textContent = "\u{1F512} BCC";
    cover.title = "You are BCC\u2019d on this email. Click to reveal.";

    cover.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      cover.remove();
    });

    // Position cover inside the target element itself — no wrapping
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
    // Gmail messages are role="listitem" elements
    const messages = document.querySelectorAll('[role="listitem"]');

    for (const msg of messages) {
      if (msg.hasAttribute(PROCESSED_ATTR)) continue;
      msg.setAttribute(PROCESSED_ATTR, "true");

      if (!isBccMessage(msg)) continue;
      msg.setAttribute(GUARD_ATTR, "true");

      const replyButtons = findReplyButtons(msg);
      for (const btn of replyButtons) {
        createCover(btn);
      }
    }

    // Also check for bottom reply buttons that live outside the listitem
    // (they're siblings in a parent container)
    // Walk up from any guarded listitem to find nearby reply links
    const guardedMessages = document.querySelectorAll(
      `[role="listitem"][${GUARD_ATTR}]`
    );
    for (const msg of guardedMessages) {
      // The bottom Reply/Forward buttons are in a sibling div within
      // a shared ancestor (~4 levels up from the listitem)
      let ancestor = msg.parentElement;
      for (let i = 0; i < 5 && ancestor; i++) {
        const links = ancestor.querySelectorAll('span[role="link"]');
        for (const link of links) {
          const text = link.textContent.trim();
          if (
            (text === "Reply" || text === "Reply all") &&
            !link.querySelector(".bcc-guard-cover")
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
