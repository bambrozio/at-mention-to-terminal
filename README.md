# at-mention-to-terminal

Send an `@file#L10-21` mention of your current selection to the terminal you last used, and move focus there. Built for running several [Claude Code](https://docs.claude.com/en/docs/claude-code) CLI sessions in one VS Code window.

> **Unofficial.** This is a community extension. It is not made by, endorsed by, or affiliated with Anthropic.

## Why this exists

The official Claude Code extension has a command, **Insert At-Mentioned** (`Cmd+Opt+K` / `Ctrl+Alt+K`), that inserts a reference to your current selection into a running `claude` session. It works well with one session. With several `claude` sessions open in different terminals of the same VS Code window, the mention often lands in the wrong one.

The cause is how the IDE integration is built:

- Each VS Code window runs **one** local WebSocket server for Claude Code. Every terminal in the window gets the same `CLAUDE_CODE_SSE_PORT`, so there is no per-terminal channel.
- Only **one** `claude` session can hold that connection at a time. Others get "only one instance can connect at a time" when they run `/ide`.
- Insert At-Mentioned sends the mention to whichever session holds the connection. It doesn't look at which terminal you are using.

So the mention goes to the connected session, which is often not the one you're working in. You also can't move the connection with `/ide` while that session is still running.

This extension skips the IDE connection. It types the mention straight into the **active terminal**, which is the one you used last, as if you had typed it yourself. Claude Code reads typed `@` mentions the same way, so the result is identical, and it lands in the session you meant.

## What it does

When you press `Cmd+Opt+K` (macOS) or `Ctrl+Alt+K` (Windows/Linux) in an editor, it:

1. Builds a mention for the current file and selection:
   - Path relative to the workspace (absolute if the file is outside it)
   - `#L10-21` for a multi-line selection, `#L10` for one line, nothing if no text is selected
   - Wrapped as `@"..."` if the path contains spaces, because Claude Code ends an unquoted mention at the first space
   - A selection that ends at the very start of a line doesn't count that line, so dragging from line 10 to the start of line 22 gives `#L10-21`
2. Types it into the active terminal, followed by a space and without pressing Enter.
3. Moves keyboard focus to that terminal so you can keep typing your prompt.

Examples:

```
@src/extension.js#L12-30
@README.md
@"docs/design notes.md#L4-9"
```

## Installation

### From a release `.vsix`

Download the `.vsix` from the [Releases](https://github.com/bambrozio/at-mention-to-terminal/releases) page, then:

```sh
code --install-extension at-mention-to-terminal-0.1.0.vsix
```

Or use **Extensions** view → `...` → **Install from VSIX...**.

### From source

```sh
git clone https://github.com/bambrozio/at-mention-to-terminal.git
cd at-mention-to-terminal
npm install
npm run package
code --install-extension at-mention-to-terminal-*.vsix
```

Reload the window afterwards (**Developer: Reload Window**).

### Free up the shortcut

This extension uses the same shortcut as the official **Insert At-Mentioned** command. To make sure `Cmd+Opt+K` runs this one, turn off the official binding in your `keybindings.json` (**Preferences: Open Keyboard Shortcuts (JSON)**):

```jsonc
[
  { "key": "cmd+alt+k", "command": "-claude-code.insertAtMentioned" }
]
```

On Windows/Linux, use `ctrl+alt+k`. If you'd rather keep both, bind **At-Mention to Terminal: Send Selection to Active Terminal** (`atMentionToTerminal.send`) to a different key instead.

## Usage

1. Click into the terminal running the `claude` session you want to use. It becomes the active terminal.
2. Go back to the editor and select some lines (or select nothing to reference the whole file).
3. Press `Cmd+Opt+K` / `Ctrl+Alt+K`.
4. The mention appears in that terminal's prompt and the cursor is there. Type the rest of your prompt and press Enter.

You can also run the command from the Command Palette: **At-Mention to Terminal: Send Selection to Active Terminal**.

## Limitations

- **Typed, not sent through the IDE.** Because the mention is typed into the terminal, it works with any program running there. It doesn't use other parts of the IDE connection; Claude Code features such as diff views and selection sync still depend on `/ide`.
- **Active terminal = last used.** With several terminals open, it's the one you last focused or created. If no terminal is open, you get a warning and nothing is sent.
- **Unusual paths.** Paths that contain `"` or `#` are sent as-is and may be misread by Claude Code (the official command refuses them for the same reason).

## Development

```sh
npm install          # installs @vscode/vsce
npm run check        # syntax-check the source
npm run package      # builds at-mention-to-terminal-<version>.vsix
```

To try changes without installing, open this folder in VS Code and press `F5` to launch an Extension Development Host.

The code is a single file, [`src/extension.js`](src/extension.js), with no runtime dependencies.

## License

[MIT](LICENSE)
