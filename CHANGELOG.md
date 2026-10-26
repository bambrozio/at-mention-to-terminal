# Changelog

## 0.1.0

- First release: `Cmd+Opt+K` / `Ctrl+Alt+K` sends an `@path#Lstart-end` mention of the current selection to the active terminal and focuses it.
- Paths containing whitespace are sent quoted (`@"path with spaces#L1-5"`).
- A selection that ends at column 0 of a line doesn't count that line.
