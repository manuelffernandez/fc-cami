const setupFooterGiftHelp = () => {
  const giftTrigger = document.querySelector("[data-gift-trigger]");
  const helpModal = document.querySelector("[data-help-modal]");
  const helpOverlay = document.querySelector("[data-help-overlay]");
  const helpClose = document.querySelector("[data-help-close]");
  const helpDialog = helpModal?.querySelector(".gift-help__dialog");

  if (
    !(giftTrigger instanceof HTMLButtonElement) ||
    !(helpModal instanceof HTMLDivElement)
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
      giftTrigger.focus({ preventScroll: true });
    }, 220);
  };

  giftTrigger.addEventListener("click", openHelp);
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

export const setupShutdown = () => {
  const shutdownTrigger = document.querySelector<HTMLButtonElement>("[data-shutdown-trigger]");
  const modal = document.querySelector<HTMLDivElement>("[data-shutdown-modal]");

  if (!shutdownTrigger || !modal) {
    return;
  }

  if (modal.dataset.shutdownReady === "true") {
    return;
  }

  modal.dataset.shutdownReady = "true";

  const overlay = modal.querySelector("[data-shutdown-overlay]");
  const closeBtn = modal.querySelector("[data-shutdown-close]");
  const dialog = modal.querySelector<HTMLElement>(".shutdown-modal__dialog");
  const frames = Array.from(modal.querySelectorAll<HTMLElement>("[data-shutdown-frame]"));
  const message = modal.querySelector<HTMLElement>("[data-shutdown-message]");

  let hideTimer: number | undefined;
  let frameInterval: number | undefined;

  const clearTimers = () => {
    window.clearTimeout(hideTimer);
    window.clearInterval(frameInterval);
    hideTimer = undefined;
    frameInterval = undefined;
  };

  const resetFrames = () => {
    frames.forEach((f) => f.classList.remove("is-active"));
    message?.classList.remove("is-visible");
  };

  const playAnimation = () => {
    let currentFrame = 0;
    frames[0]?.classList.add("is-active");

    frameInterval = window.setInterval(() => {
      const next = currentFrame + 1;

      if (next >= frames.length) {
        window.clearInterval(frameInterval);
        frameInterval = undefined;
        message?.classList.add("is-visible");
        return;
      }

      frames[currentFrame]?.classList.remove("is-active");
      frames[next]?.classList.add("is-active");
      currentFrame = next;
    }, 300);
  };

  const openShutdown = () => {
    clearTimers();
    resetFrames();
    modal.hidden = false;
    document.body.classList.add("shutdown-modal-open");

    window.requestAnimationFrame(() => {
      modal.classList.add("is-visible");
      dialog?.focus();
      playAnimation();
    });
  };

  const closeShutdown = () => {
    if (modal.hidden) {
      return;
    }

    clearTimers();
    modal.classList.remove("is-visible");
    document.body.classList.remove("shutdown-modal-open");

    hideTimer = window.setTimeout(() => {
      modal.hidden = true;
      resetFrames();
      shutdownTrigger.focus({ preventScroll: true });
    }, 220);
  };

  shutdownTrigger.addEventListener("click", openShutdown);
  overlay?.addEventListener("click", closeShutdown);
  closeBtn?.addEventListener("click", closeShutdown);
  document.addEventListener("shutdown:open-request", openShutdown);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) {
      closeShutdown();
    }
  });
};
