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

## License

MIT
