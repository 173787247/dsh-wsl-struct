# dsh-wsl-struct

> **语言：** **中文**（本页） · [English](./README.en.md)

沙箱化 jq / yq / sqlite3（只读 SELECT）。

| | |
|---|---|
| 版本 | **0.1.0** |
| 套件 | [dsh-wsl-kit](https://github.com/173787247/dsh-wsl-kit) **可选**，不在 `install.sh` |

## 安装

```sh
dsh plugin --profile web add github:173787247/dsh-wsl-struct
# 或本机 path：
# dsh plugin --profile web add /mnt/c/Users/YOU/Desktop/AIFullStackDevelopment/dsh-wsl-struct
```

kit 批量链接（可选）：`bash dsh-wsl-kit/scripts/link-linux-plugins.sh`

## 工具

| 工具 | 作用 |
|------|------|
| `struct_status` | CLI 是否在 PATH |
| `struct_jq` | jq 过滤 |
| `struct_yq` | yq 查询 |
| `struct_sqlite` | 只读 SQL |

## 配置要点

`allowRoots / timeoutMs`

默认根：`$HOME`、`~/.dsh`、`/tmp`。禁止破坏性 SQL。

## 兼容性

| 字段 | 值 |
|------|----|
| **插件** | `dsh-wsl-struct` **0.1.0** |
| **最低 dsh** | ≥ **0.1.2**（Web UI 一次性 `?token=`，Windows 中继 `:3081`） |
| **最新验证** | 以 [dsh-wsl-kit 兼容性](https://github.com/173787247/dsh-wsl-kit#compatibility-2026-09) 为准（当前 **`0.1.7-alpha.2`**）— 套件唯一真源 |
| **套件档位** | 可选（默认不在 `install.sh` / `KIT_SET=daily`） |

## License

MIT
