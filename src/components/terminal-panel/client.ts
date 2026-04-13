type TerminalOutputTone = "muted" | "ok" | "notice" | "error" | "surface";

type TerminalOutputEntry = {
  type: "output";
  tone?: TerminalOutputTone;
  value: string;
};

type TerminalCommandEntry = {
  type: "command";
  value: string;
};

type TerminalEntry = TerminalCommandEntry | TerminalOutputEntry;

type TerminalCommandResult = {
  clearHistory: boolean;
  outputs: Array<Omit<TerminalOutputEntry, "type">>;
};

let secretsUnlocked = false;

const promptUserLabel = "root@celebration:";
const promptSymbolLabel = "~#";

const toneClassByName: Record<TerminalOutputTone, string> = {
  muted: "terminal__line--muted",
  ok: "terminal__line--ok",
  notice: "terminal__line--notice",
  error: "terminal__line--error",
  surface: "terminal__line--surface",
};

const allowedNavigationKeys = new Set([
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "Backspace",
  "Delete",
  "End",
  "Escape",
  "Home",
  "Tab",
]);

const allowedInputTypes = new Set([
  "deleteByCut",
  "insertText",
  "insertCompositionText",
  "insertFromPaste",
  "deleteContentBackward",
  "deleteContentForward",
]);

const CONFETTI_COLORS = ["#ff77e9", "#8ff5ff", "#ffd166", "#c6ff7d", "#ffffff"];

const generateStarPath = (
  outerR: number,
  innerR: number,
  grid: number,
): [number, number][] => {
  const snap = (v: number) => Math.round(v / grid) * grid;
  const vertices: [number, number][] = [];

  for (let i = 0; i < 10; i++) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / 10;
    const r = i % 2 === 0 ? outerR : innerR;
    vertices.push([snap(r * Math.cos(angle)), snap(r * Math.sin(angle))]);
  }

  const path: [number, number][] = [];

  for (let i = 0; i < vertices.length; i++) {
    const [x0, y0] = vertices[i];
    const [x1, y1] = vertices[(i + 1) % vertices.length];
    const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) / grid;

    for (let s = 0; s <= steps; s++) {
      const t = steps === 0 ? 0 : s / steps;
      const x = snap(x0 + (x1 - x0) * t);
      const y = snap(y0 + (y1 - y0) * t);
      const last = path[path.length - 1];

      if (!last || last[0] !== x || last[1] !== y) {
        path.push([x, y]);
      }
    }
  }

  return path;
};

const playSecretAnimation = () => {
  const PIXEL_SIZE = 8;
  const OUTER_R = 80;
  const INNER_R = 35;
  const SHARD_COLORS = ["#ffd166", "#ffea99", "#ffbf00", "#fff1cc", "#ffffff"];

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  const overlay = document.createElement("div");
  overlay.className = "secret-overlay";
  document.body.appendChild(overlay);

  const starContainer = document.createElement("div");
  starContainer.className = "secret-star";
  overlay.appendChild(starContainer);

  const path = generateStarPath(OUTER_R, INNER_R, PIXEL_SIZE);
  const buildStart = 300;
  const buildDuration = 2500;
  const delayPerPixel = buildDuration / path.length;

  path.forEach(([x, y], i) => {
    const pixel = document.createElement("div");
    pixel.className = "secret-pixel";
    pixel.style.cssText = [
      `left:${x}px`,
      `top:${y}px`,
      `width:${PIXEL_SIZE}px`,
      `height:${PIXEL_SIZE}px`,
      `animation-delay:${Math.round(buildStart + i * delayPerPixel)}ms`,
    ].join(";");
    starContainer.appendChild(pixel);
  });

  setTimeout(() => {
    const pixels = starContainer.querySelectorAll<HTMLElement>(".secret-pixel");

    pixels.forEach((pixel) => {
      const px = parseFloat(pixel.style.left);
      const py = parseFloat(pixel.style.top);
      const shardCount = 3 + Math.floor(Math.random() * 3);

      for (let s = 0; s < shardCount; s++) {
        const shard = document.createElement("div");
        shard.className = "secret-shard";
        const size = 2 + Math.floor(Math.random() * 4);
        const baseAngle = Math.atan2(py, px);
        const angle = baseAngle + (Math.random() - 0.5) * 1.4;
        const dist = 100 + Math.random() * 220;
        const cx = Math.cos(angle) * dist;
        const cy = Math.sin(angle) * dist;
        const delay = Math.floor(Math.random() * 120);

        shard.style.cssText = [
          `left:${px}px`,
          `top:${py}px`,
          `width:${size}px`,
          `height:${size}px`,
          `background:${SHARD_COLORS[s % SHARD_COLORS.length]}`,
          `--cx:${cx}px`,
          `--cy:${cy}px`,
          `animation-delay:${delay}ms`,
        ].join(";");

        starContainer.appendChild(shard);
      }

      pixel.remove();
    });
  }, 3000);

  setTimeout(() => {
    overlay.classList.add("secret-overlay--fade-out");
    setTimeout(() => overlay.remove(), 600);
  }, 3900);
};

// ── stylinson ─────────────────────────────────────────────────────
const generateHeartPath = (scale: number, grid: number): [number, number][] => {
  const snap = (v: number) => Math.round(v / grid) * grid;
  const path: [number, number][] = [];

  for (let i = 0; i <= 500; i++) {
    const t = (i / 500) * 2 * Math.PI;
    const x = snap(scale * 16 * Math.pow(Math.sin(t), 3));
    const y = snap(
      -scale *
        (13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t)),
    );
    const last = path[path.length - 1];
    if (!last || last[0] !== x || last[1] !== y) {
      path.push([x, y]);
    }
  }

  return path;
};

const playStylinsionAnimation = () => {
  const PIXEL = 8;
  const SCALE = 9;

  // Dismiss mobile keyboard before showing the animation
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  const overlay = document.createElement("div");
  overlay.className = "secret-overlay";
  document.body.appendChild(overlay);

  const scene = document.createElement("div");
  scene.className = "stylinson-scene";
  overlay.appendChild(scene);

  const imgLeft = document.createElement("img");
  imgLeft.className = "stylinson-img";
  imgLeft.src = "/images/styles.png";
  imgLeft.alt = "";
  scene.appendChild(imgLeft);

  const imgRight = document.createElement("img");
  imgRight.className = "stylinson-img stylinson-img--mirror";
  imgRight.src = "/images/tomlinson.png";
  imgRight.alt = "";
  scene.appendChild(imgRight);

  const heartContainer = document.createElement("div");
  heartContainer.className = "stylinson-heart";
  scene.appendChild(heartContainer);

  const path = generateHeartPath(SCALE, PIXEL);
  const buildStart = 400;
  const buildDuration = 3000;
  const delayPerPixel = buildDuration / path.length;

  path.forEach(([x, y], i) => {
    const px = document.createElement("div");
    px.className = "stylinson-pixel";
    px.style.cssText = [
      `left:${x}px`,
      `top:${y}px`,
      `width:${PIXEL}px`,
      `height:${PIXEL}px`,
      `animation-delay:${Math.round(buildStart + i * delayPerPixel)}ms`,
    ].join(";");
    heartContainer.appendChild(px);
  });

  const textDelay = buildStart + buildDuration;

  const text = document.createElement("div");
  text.className = "stylinson-text";
  text.textContent = "Love is only for the brave";
  text.style.animationDelay = `${textDelay}ms`;
  overlay.appendChild(text);

  setTimeout(() => {
    heartContainer.remove();
    overlay.style.transition = "opacity 0.6s steps(4)";
    overlay.style.opacity = "0";
    setTimeout(() => overlay.remove(), 700);
  }, 5500);
};

// ── potter / styles ───────────────────────────────────────────────
const playHarrypAnimation = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  const overlay = document.createElement("div");
  overlay.className = "secret-overlay";
  document.body.appendChild(overlay);

  const img = document.createElement("img");
  img.className = "harryp-image";
  img.src = "/images/patronum.png";
  img.alt = "Expecto Patronum";
  overlay.appendChild(img);

  const spell = document.createElement("div");
  spell.className = "harryp-spell";
  spell.textContent = "Expecto Patronum";
  overlay.appendChild(spell);

  // Flash + particle burst coordinated at spell cast moment
  setTimeout(() => {
    const flash = document.createElement("div");
    flash.className = "harryp-flash";
    document.body.appendChild(flash);
    setTimeout(() => flash.remove(), 700);

    const BLUES = [
      "#a8d8ff",
      "#60b8ff",
      "#1e90ff",
      "#4da6ff",
      "#c8e8ff",
      "#7ecbff",
      "#ffffff",
      "#b0d0ff",
    ];
    const count = 80;
    const ox = window.innerWidth / 2;
    const oy = window.innerHeight / 2;

    for (let i = 0; i < count; i++) {
      const px = document.createElement("div");
      px.className = "harryp-particle";

      const size = (2 + Math.floor(Math.random() * 3)) * 4;
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
      const dist = 80 + Math.random() * 320;
      const delay = Math.floor(Math.random() * 250);

      px.style.cssText = [
        `left:${ox + (Math.random() - 0.5) * 60}px`,
        `top:${oy + (Math.random() - 0.5) * 60}px`,
        `width:${size}px`,
        `height:${size}px`,
        `background:${BLUES[i % BLUES.length]}`,
        `--cx:${Math.cos(angle) * dist}px`,
        `--cy:${Math.sin(angle) * dist}px`,
        `animation-delay:${delay}ms`,
      ].join(";");

      document.body.appendChild(px);
      setTimeout(() => px.remove(), 1100 + delay);
    }
  }, 1300);

  setTimeout(() => {
    overlay.classList.add("secret-overlay--fade-out");
    setTimeout(() => overlay.remove(), 600);
  }, 4800);
};

// ── snitch ────────────────────────────────────────────────────────
const preloadImages = (srcs: string[]): Promise<void> =>
  Promise.all(
    srcs.map(
      (src) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = src;
        }),
    ),
  ).then(() => undefined);

const playSnitchAnimation = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  const FRAMES = [
    "/images/snitch_1.png",
    "/images/snitch_2.png",
    "/images/snitch_3.png",
    "/images/snitch_2.png",
  ];
  const FRAME_MS = 100;
  const TOTAL_MS = 2800;

  const waypoints = [
    [-8, 45],
    [15, 20],
    [38, 62],
    [55, 15],
    [70, 55],
    [85, 25],
    [108, 48],
  ];

  preloadImages(FRAMES).then(() => {
    const snitch = document.createElement("div");
    snitch.className = "snitch";
    document.body.appendChild(snitch);

    const img = document.createElement("img");
    img.className = "snitch-img";
    img.src = FRAMES[0];
    img.alt = "";
    snitch.appendChild(img);

    let frameIdx = 0;
    const frameTimer = window.setInterval(() => {
      frameIdx = (frameIdx + 1) % FRAMES.length;
      img.src = FRAMES[frameIdx];
    }, FRAME_MS);

    const steps = waypoints.length - 1;
    const keyframeRules = waypoints
      .map(([x, y], i) => {
        const pct = Math.round((i / steps) * 100);
        const flip = x > 50 ? "scaleX(-1)" : "scaleX(1)";
        return `${pct}% { left:${x}vw; top:${y}vh; transform:${flip}; }`;
      })
      .join(" ");

    const styleEl = document.createElement("style");
    styleEl.textContent = `@keyframes snitch-erratic { ${keyframeRules} }`;
    document.head.appendChild(styleEl);

    snitch.style.animationName = "snitch-erratic";
    snitch.style.animationDuration = `${TOTAL_MS}ms`;

    setTimeout(() => {
      clearInterval(frameTimer);
      snitch.remove();
      styleEl.remove();
    }, TOTAL_MS + 200);
  });
};

// ── tattoo ────────────────────────────────────────────────────────
const playTattooAnimation = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  const PIXEL = 16;
  // "18" pixel art: "1" at cols 0-2, "8" at cols 4-6, centered by offset [-3, -2]
  const eighteenPixels: [number, number][] = (
    [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, 2],
      [1, 3],
      [0, 4],
      [1, 4],
      [2, 4],
      [4, 0],
      [5, 0],
      [6, 0],
      [4, 1],
      [6, 1],
      [4, 2],
      [5, 2],
      [6, 2],
      [4, 3],
      [6, 3],
      [4, 4],
      [5, 4],
      [6, 4],
    ] as [number, number][]
  ).map(([x, y]) => [x - 3, y - 2] as [number, number]);

  const overlay = document.createElement("div");
  overlay.className = "secret-overlay";
  document.body.appendChild(overlay);

  const container = document.createElement("div");
  container.className = "tattoo-container tattoo-container--buzzing";
  overlay.appendChild(container);

  const delayPerPixel = 2500 / eighteenPixels.length;
  eighteenPixels.forEach(([x, y], i) => {
    const px = document.createElement("div");
    px.className = "tattoo-pixel";
    px.style.cssText = [
      `left:${x * PIXEL}px`,
      `top:${y * PIXEL}px`,
      `width:${PIXEL}px`,
      `height:${PIXEL}px`,
    ].join(";");
    container.appendChild(px);

    setTimeout(() => {
      px.style.opacity = "1";
    }, Math.round(300 + i * delayPerPixel));
  });

  setTimeout(() => {
    container.classList.remove("tattoo-container--buzzing");
    container.classList.add("tattoo-container--glow");
  }, 3000);

  setTimeout(() => {
    const pixels = container.querySelectorAll<HTMLElement>(".tattoo-pixel");

    pixels.forEach((px) => {
      px.style.animation = "none";
      px.style.opacity = "1";
    });

    void container.offsetHeight;

    pixels.forEach((px) => {
      px.style.transition = "opacity 0.4s steps(5)";
      px.style.opacity = "0";
    });

    overlay.classList.add("secret-overlay--fade-out");
    setTimeout(() => overlay.remove(), 600);
  }, 4100);
};

// ── golden ────────────────────────────────────────────────────────
const playGoldenAnimation = () => {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  const overlay = document.createElement("div");
  overlay.className = "golden-overlay";
  document.body.appendChild(overlay);

  for (let i = 0; i < 50; i++) {
    const px = document.createElement("div");
    px.className = "golden-pixel";
    const size = (2 + Math.floor(Math.random() * 4)) * 2;
    const delay = Math.round(Math.random() * 2500);
    const dur = Math.round(1800 + Math.random() * 2000);
    px.style.cssText = [
      `left:${(Math.random() * 98).toFixed(1)}vw`,
      `width:${size}px`,
      `height:${size}px`,
      `animation-delay:${delay}ms`,
      `animation-duration:${dur}ms`,
    ].join(";");
    overlay.appendChild(px);
  }

  const text = document.createElement("div");
  text.className = "golden-text";
  text.textContent = "you're so golden";
  overlay.appendChild(text);

  setTimeout(() => {
    overlay.classList.add("golden-overlay--out");
    setTimeout(() => overlay.remove(), 800);
  }, 4500);
};

const spawnConfetti = () => {
  const count = 90;
  const originX = window.innerWidth / 2;
  const originY = window.innerHeight * 0.42;

  for (let i = 0; i < count; i++) {
    const el = document.createElement("div");
    el.className = "confetti-particle";

    const size = Math.random() * 12 + 6;
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * 420 + 120;
    const cx = Math.cos(angle) * dist;
    const cy = Math.sin(angle) * dist - 140;
    const cr = Math.random() * 720 - 360;
    const delay = Math.floor(Math.random() * 280);

    el.style.cssText = [
      `left:${originX + (Math.random() - 0.5) * 100}px`,
      `top:${originY}px`,
      `width:${size}px`,
      `height:${size}px`,
      `background:${CONFETTI_COLORS[i % CONFETTI_COLORS.length]}`,
      `--cx:${cx}px`,
      `--cy:${cy}px`,
      `--cr:${cr}deg`,
      `animation-delay:${delay}ms`,
    ].join(";");

    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2800 + delay);
  }
};

const availableCommands: Record<string, () => TerminalCommandResult> = {
  help: () => ({
    clearHistory: false,
    outputs: [
      { tone: "notice", value: "AVAILABLE COMMANDS" },
      { tone: "muted", value: "──────────────────────────────────" },
      { tone: "surface", value: "  help       — list available commands" },
      { tone: "surface", value: "  clear      — clear terminal history" },
      { tone: "surface", value: "  gift       — open birthday gift" },
      { tone: "surface", value: "  confetti   — spawn confetti burst" },
      { tone: "surface", value: "  shutdown   — blow out the candles" },
      { tone: "muted", value: "──────────────────────────────────" },
      ...(secretsUnlocked
        ? ([
            { tone: "notice", value: "SECRET COMMANDS" },
            { tone: "muted", value: "──────────────────────────────────" },
            {
              tone: "surface",
              value:
                "  secret     — ✦ Buenos dias estrellitas, la tierra les dice holaaa",
            },
            { tone: "surface", value: "  styles     — que" },
            { tone: "surface", value: "  tomlinson  — trolos" },
            { tone: "surface", value: "  stylinson  — son" },
            { tone: "surface", value: "  potter     — miedo, dementores" },
            { tone: "surface", value: "  snitch     — asjdhñaskjdgjas" },
            { tone: "surface", value: "  tattoo     — 18. forever." },
            { tone: "surface", value: "  golden     — ♪ you're so golden" },
            { tone: "muted", value: "──────────────────────────────────" },
          ] as Array<Omit<TerminalOutputEntry, "type">>)
        : ([
            { tone: "muted", value: "  ✦ Unlock the secret commands." },
            { tone: "muted", value: "  Find the red button." },
          ] as Array<Omit<TerminalOutputEntry, "type">>)),
    ],
  }),

  clear: () => ({ clearHistory: true, outputs: [] }),

  gift: () => {
    document.dispatchEvent(new CustomEvent("gift:open-request"));
    return {
      clearHistory: false,
      outputs: [{ tone: "ok", value: "GIFT.EXE — executing..." }],
    };
  },

  confetti: () => {
    spawnConfetti();
    return {
      clearHistory: false,
      outputs: [{ tone: "ok", value: "CONFETTI_BURST: deployed" }],
    };
  },

  shutdown: () => {
    document.dispatchEvent(new CustomEvent("shutdown:open-request"));
    return {
      clearHistory: false,
      outputs: [{ tone: "ok", value: "SHUTDOWN.EXE — executing..." }],
    };
  },

  secret: () => {
    playSecretAnimation();
    return {
      clearHistory: false,
      outputs: [{ tone: "muted", value: "✦ something is happening..." }],
    };
  },

  styles: () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const overlay = document.createElement("div");
    overlay.className = "secret-overlay";
    document.body.appendChild(overlay);

    const img = document.createElement("img");
    img.className = "harryp-image";
    img.src = "/images/styles.png";
    img.alt = "Harry Styles";
    overlay.appendChild(img);

    const spell = document.createElement("div");
    spell.className = "harryp-spell";
    spell.textContent = "same lips red, same eyes blue,";
    overlay.appendChild(spell);

    setTimeout(() => {
      overlay.classList.add("secret-overlay--fade-out");
      setTimeout(() => overlay.remove(), 600);
    }, 4800);

    return {
      clearHistory: false,
      outputs: [{ tone: "muted", value: "♪ watermelon sugar high..." }],
    };
  },

  potter: () => {
    playHarrypAnimation();
    return {
      clearHistory: false,
      outputs: [{ tone: "muted", value: "✦ Expecto Patronum..." }],
    };
  },

  snitch: () => {
    playSnitchAnimation();
    return {
      clearHistory: false,
      outputs: [{ tone: "muted", value: "the snitch is out there." }],
    };
  },

  tattoo: () => {
    playTattooAnimation();
    return {
      clearHistory: false,
      outputs: [{ tone: "muted", value: "18. forever." }],
    };
  },

  stylinson: () => {
    playStylinsionAnimation();
    return {
      clearHistory: false,
      outputs: [{ tone: "muted", value: "✦ love is only for the brave..." }],
    };
  },

  tomlinson: () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const overlay = document.createElement("div");
    overlay.className = "secret-overlay";
    document.body.appendChild(overlay);

    const img = document.createElement("img");
    img.className = "harryp-image harryp-image--mirrored";
    img.src = "/images/tomlinson.png";
    img.alt = "Louis Tomlinson";
    overlay.appendChild(img);

    const spell = document.createElement("div");
    spell.className = "harryp-spell";
    spell.textContent = "same white shirt, couple more tattoos";
    overlay.appendChild(spell);

    setTimeout(() => {
      overlay.classList.add("secret-overlay--fade-out");
      setTimeout(() => overlay.remove(), 600);
    }, 4800);

    return {
      clearHistory: false,
      outputs: [{ tone: "muted", value: "♪ walls don't lie..." }],
    };
  },

  golden: () => {
    playGoldenAnimation();
    return {
      clearHistory: false,
      outputs: [{ tone: "ok", value: "♪ golden..." }],
    };
  },
};

const createPromptFragment = () => {
  const fragment = document.createDocumentFragment();
  const promptUser = document.createElement("span");
  const promptSymbol = document.createElement("span");

  promptUser.className = "terminal__prompt-user";
  promptUser.textContent = promptUserLabel;

  promptSymbol.className = "terminal__prompt-symbol";
  promptSymbol.textContent = promptSymbolLabel;

  fragment.append(promptUser, promptSymbol);

  return fragment;
};

const createCommandEntry = (value: string) => {
  const line = document.createElement("p");
  line.className = "terminal__line";
  line.append(createPromptFragment());

  if (value.length > 0) {
    line.append(document.createTextNode(` ${value}`));
  }

  return line;
};

const createOutputEntry = ({
  value,
  tone = "surface",
}: Omit<TerminalOutputEntry, "type">) => {
  const line = document.createElement("p");
  line.className = `terminal__line ${toneClassByName[tone]}`;
  line.textContent = value;

  return line;
};

const executeCommand = (rawCommand: string): TerminalCommandResult => {
  const normalizedCommand = rawCommand.trim();

  if (!normalizedCommand) {
    return {
      clearHistory: false,
      outputs: [],
    };
  }

  const [commandName] = normalizedCommand.split(/\s+/);
  const command = availableCommands[commandName.toLowerCase()];

  if (!command) {
    return {
      clearHistory: false,
      outputs: [
        {
          tone: "error",
          value: `bash: ${commandName}: command not found`,
        },
        {
          tone: "muted",
          value: `Type "help" to see available commands.`,
        },
      ],
    };
  }

  return command();
};

const moveCaretToEnd = (textarea: HTMLTextAreaElement) => {
  const cursorAtEnd = textarea.value.length;
  textarea.setSelectionRange(cursorAtEnd, cursorAtEnd);
};

const focusTextarea = (
  textarea: HTMLTextAreaElement,
  { preventScroll = false }: { preventScroll?: boolean } = {},
) => {
  if (preventScroll) {
    try {
      textarea.focus({ preventScroll: true });
      return;
    } catch {
      // Fallback for browsers without focus options support.
    }
  }

  textarea.focus();
};

const requestTerminalAttention = (textarea: HTMLTextAreaElement) => {
  const terminal = textarea.closest("[data-terminal-panel]");

  if (!(terminal instanceof HTMLElement)) {
    return;
  }

  terminal.classList.remove("terminal--attention");
  void terminal.offsetWidth;
  terminal.classList.add("terminal--attention");
  focusTextarea(textarea, { preventScroll: true });
  moveCaretToEnd(textarea);
};

const syncTerminalInput = (terminal: Element) => {
  if (
    !(terminal instanceof HTMLElement) ||
    terminal.dataset.terminalReady === "true"
  ) {
    return;
  }

  const body = terminal.querySelector("[data-terminal-body]");
  const history = terminal.querySelector("[data-terminal-history]");
  const container = terminal.querySelector("[data-terminal-input]");
  const composer = terminal.querySelector("[data-terminal-composer]");
  const mirror = terminal.querySelector("[data-terminal-mirror]");
  const textarea = terminal.querySelector("[data-terminal-textarea]");
  let syncFrame = 0;
  let entries: TerminalEntry[] = [];
  let previousComposerHeight = 0;

  if (
    !(body instanceof HTMLElement) ||
    !(history instanceof HTMLElement) ||
    !(container instanceof HTMLElement) ||
    !(composer instanceof HTMLElement) ||
    !(mirror instanceof HTMLElement) ||
    !(textarea instanceof HTMLTextAreaElement)
  ) {
    return;
  }

  terminal.dataset.terminalReady = "true";

  const renderHistory = () => {
    history.replaceChildren(
      ...entries.map((entry) => {
        if (entry.type === "command") {
          return createCommandEntry(entry.value);
        }

        return createOutputEntry(entry);
      }),
    );

    body.scrollTop = body.scrollHeight;
  };

  const syncComposer = ({
    forceScroll = false,
  }: { forceScroll?: boolean } = {}) => {
    mirror.textContent = `${textarea.value}\u200b`;
    const nextComposerHeight = composer.offsetHeight;

    if (forceScroll || nextComposerHeight !== previousComposerHeight) {
      body.scrollTop = body.scrollHeight;
    }

    previousComposerHeight = nextComposerHeight;
  };

  const scheduleComposerSync = (options?: { forceScroll?: boolean }) => {
    cancelAnimationFrame(syncFrame);
    syncFrame = requestAnimationFrame(() => {
      syncComposer(options);
    });
  };

  const submitCommand = () => {
    const rawCommand = textarea.value.replace(/[\r\n]+/g, " ").trimEnd();
    const result = executeCommand(rawCommand);

    if (result.clearHistory) {
      entries = [];
      renderHistory();
    } else {
      entries.push({
        type: "command",
        value: rawCommand,
      });

      if (result.outputs.length > 0) {
        entries.push(
          ...result.outputs.map((output) => ({
            ...output,
            type: "output" as const,
          })),
        );
      }

      renderHistory();
    }

    textarea.value = "";
    scheduleComposerSync({ forceScroll: true });
  };

  const focusInput = (event: Event) => {
    if (event.target === textarea) {
      return;
    }

    focusTextarea(textarea, { preventScroll: true });
    moveCaretToEnd(textarea);
  };

  container.addEventListener("click", focusInput);
  body.addEventListener("click", focusInput);

  document.addEventListener("terminal:focus-request", () => {
    requestTerminalAttention(textarea);
  });

  textarea.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submitCommand();
      return;
    }

    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const isPlainCharacter = event.key.length === 1;
    const isAllowedKey =
      isPlainCharacter || allowedNavigationKeys.has(event.key);

    if (!isAllowedKey) {
      event.preventDefault();
    }
  });

  textarea.addEventListener("beforeinput", (event) => {
    if (!allowedInputTypes.has(event.inputType)) {
      event.preventDefault();
    }
  });

  textarea.addEventListener("input", () => {
    const sanitizedValue = textarea.value.replace(/[\r\n]+/g, " ");

    if (sanitizedValue !== textarea.value) {
      textarea.value = sanitizedValue;
    }

    scheduleComposerSync();
  });

  textarea.addEventListener("focus", () => {
    scheduleComposerSync({ forceScroll: true });
  });

  syncComposer({ forceScroll: true });
};

const showUnlockModal = () => {
  secretsUnlocked = true;

  const modal = document.createElement("div");
  modal.className = "unlock-modal";

  const box = document.createElement("div");
  box.className = "unlock-modal__box";

  const title = document.createElement("p");
  title.className = "unlock-modal__title";
  title.textContent = "// SECRET COMMANDS UNLOCKED";

  const msg = document.createElement("p");
  msg.className = "unlock-modal__msg";
  msg.textContent = 'Type "help" to see them.';

  const btn = document.createElement("button");
  btn.className = "unlock-modal__btn";
  btn.textContent = "[ OK ]";
  btn.addEventListener("click", () => {
    modal.classList.add("unlock-modal--out");
    setTimeout(() => modal.remove(), 400);
  });

  box.append(title, msg, btn);
  modal.appendChild(box);
  document.body.appendChild(modal);
};

const setupTerminalPanel = () => {
  const terminals = document.querySelectorAll("[data-terminal-panel]");

  terminals.forEach((terminal) => {
    syncTerminalInput(terminal);
  });

  const secretTrigger = document.querySelector("[data-secret-trigger]");

  if (secretTrigger instanceof HTMLElement) {
    const activate = () => {
      if (!secretsUnlocked) showUnlockModal();
    };

    secretTrigger.addEventListener("click", activate);
    secretTrigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") activate();
    });
  }
};

export default setupTerminalPanel;
