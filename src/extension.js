const vscode = require("vscode");

// Builds the same text Claude Code's own "Insert At-Mentioned" command produces:
// a workspace-relative path plus an optional #Lstart-end line range.
// Control characters (newline, ESC, ...) would act as keystrokes in the terminal,
// e.g. a crafted file name could run a command in a shell. '"' and '#' would be
// misread by Claude Code, so the official command refuses them too.
const UNSAFE_PATH = /[\u0000-\u001f\u007f-\u009f"#]/;

function buildMention(editor) {
  const path = vscode.workspace.asRelativePath(editor.document.uri, false);
  if (UNSAFE_PATH.test(path)) return null;
  const sel = editor.selection;
  let range = "";
  if (!sel.isEmpty) {
    const start = sel.start.line + 1;
    // A selection ending at column 0 of a line doesn't really include that line.
    let end = sel.end.line + 1;
    if (sel.end.character === 0 && end > start) end -= 1;
    range = start === end ? `#L${start}` : `#L${start}-${end}`;
  }
  const ref = path + range;
  // The Claude Code CLI ends an unquoted mention at whitespace; @"..." keeps it whole.
  return /\s/.test(ref) ? `@"${ref}" ` : `@${ref} `;
}

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("atMentionToTerminal.send", async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const terminal = vscode.window.activeTerminal;
      if (!terminal) {
        vscode.window.showWarningMessage("No active terminal to send the @-mention to.");
        return;
      }
      const mention = buildMention(editor);
      if (mention === null) {
        vscode.window.showWarningMessage(
          "This file's path contains characters that can't be sent safely as an @-mention."
        );
        return;
      }
      terminal.sendText(mention, false);
      terminal.show(false);
      // show(false) alone doesn't always move focus when the panel is already visible.
      await vscode.commands.executeCommand("workbench.action.terminal.focus");
    })
  );
}

module.exports = { activate, deactivate() {} };
