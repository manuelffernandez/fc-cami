const setupFooterGiftHelp = () => {
  const helpTrigger = document.querySelector("[data-help-trigger]");
  const helpModal = document.querySelector("[data-help-modal]");
  const helpOverlay = document.querySelector("[data-help-overlay]");
  const helpClose = document.querySelector("[data-help-close]");
  const helpDialog = helpModal?.querySelector(".gift-help__dialog");

  if (
    !(helpTrigger instanceof HTMLButtonElement)
    || !(helpModal instanceof HTMLDivElement)
  ) {
    return;
  }

  if (helpModal.dataset.helpReady === "true") {
    return;
  }

  helpModal.dataset.helpReady = "true";

  let revealTimer: number | undefined;
  let hideTimer: number | undefined;

  const clearTimers = () => {
    if (revealTimer !== undefined) {
      window.clearTimeout(revealTimer);
    }

    if (hideTimer !== undefined) {
      window.clearTimeout(hideTimer);
    }

    revealTimer = undefined;
    hideTimer = undefined;
  };

  const openHelp = () => {
    clearTimers();
    helpModal.hidden = false;
    helpModal.classList.remove("is-shaking", "is-revealed");
    document.body.classList.add("gift-help-open");

    window.requestAnimationFrame(() => {
      helpModal.classList.add("is-visible");

      if (helpDialog instanceof HTMLElement) {
        helpDialog.focus();
      }

      window.requestAnimationFrame(() => {
        helpModal.classList.add("is-shaking");
      });
    });

    revealTimer = window.setTimeout(() => {
      helpModal.classList.remove("is-shaking");
      helpModal.classList.add("is-revealed");
    }, 900);
  };

  const closeHelp = () => {
    if (helpModal.hidden) {
      return;
    }

    clearTimers();
    helpModal.classList.remove("is-shaking", "is-revealed", "is-visible");
    document.body.classList.remove("gift-help-open");

    hideTimer = window.setTimeout(() => {
      helpModal.hidden = true;
      helpTrigger.focus({ preventScroll: true });
    }, 220);
  };

  helpTrigger.addEventListener("click", openHelp);
  helpOverlay?.addEventListener("click", closeHelp);
  helpClose?.addEventListener("click", closeHelp);
  document.addEventListener("gift:open-request", openHelp);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !helpModal.hidden) {
      closeHelp();
    }
  });
};

export default setupFooterGiftHelp;
