# dsh-wsl-struct

> **Languages:** [中文（首页）](./README.md) · **English** (this file)

Sandboxed jq / yq / read-only sqlite3.

| | |
|---|---|
| Version | **0.1.0** |
| Kit | Optional companion to [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit); not in `install.sh` |

## Install

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-struct
```

Batch link (optional): `bash dsh-wsl-kit/scripts/link-linux-plugins.sh`

## Tools

| Tool | Role |
|------|------|
| `struct_status` | CLI on PATH |
| `struct_jq` | jq filter |
| `struct_yq` | yq expression |
| `struct_sqlite` | SELECT-only SQL |

## Config

`allowRoots / timeoutMs`

Default roots: `$HOME`, `~/.dsh`, `/tmp`. Mutating SQL refused.

## Compatibility

| Field | Value |
|-------|-------|
| **Plugin** | `dsh-wsl-struct` **0.1.0** |
| **Minimum dsh** | ≥ **0.1.2** (web UI one-shot `?token=` on Windows relay `:3081`) |
| **Latest verified** | See [dsh-wsl-kit Compatibility](https://github.com/173787247/dsh-wsl-kit#compatibility-2026-09) (currently **`0.1.7-alpha.2`**) — single source of truth for the suite |
| **Kit set** | optional (not in `install.sh` / `KIT_SET=daily` by default) |

## License

MIT
