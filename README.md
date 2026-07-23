# tnt

Scaffold a Tauri 2 + Next.js (App Router, static export) app in one command.

## Usage

```bash
pnpm dlx github:Elixir-Piloting/tnt
```

You will be prompted for:

- **App name** — used as the folder name and display name
- **Bundle identifier** — a reverse-DNS identifier (e.g. `com.example.app`)

The CLI copies the template, replaces placeholders, and runs `pnpm install`. After it finishes:

```bash
cd <your-app-name>
pnpm tauri dev
```

## Credits

Based on [kvnxiao/tauri-nextjs-template](https://github.com/kvnxiao/tauri-nextjs-template), a Tauri 2 + Next.js 16 (App Router) + TailwindCSS 4 template.
