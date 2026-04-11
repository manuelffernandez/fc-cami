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

const createOutputEntry = ({ value, tone = "surface" }: Omit<TerminalOutputEntry, "type">) => {
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
  if (!(terminal instanceof HTMLElement) || terminal.dataset.terminalReady === "true") {
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
    !(body instanceof HTMLElement)
    || !(history instanceof HTMLElement)
    || !(container instanceof HTMLElement)
    || !(composer instanceof HTMLElement)
    || !(mirror instanceof HTMLElement)
    || !(textarea instanceof HTMLTextAreaElement)
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

  const syncComposer = ({ forceScroll = false }: { forceScroll?: boolean } = {}) => {
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
    const isAllowedKey = isPlainCharacter || allowedNavigationKeys.has(event.key);

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

const setupTerminalPanel = () => {
  const terminals = document.querySelectorAll("[data-terminal-panel]");

  terminals.forEach((terminal) => {
    syncTerminalInput(terminal);
  });
};

export default setupTerminalPanel;
