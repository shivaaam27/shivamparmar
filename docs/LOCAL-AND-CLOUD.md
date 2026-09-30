# Working locally and in the cloud

The code lives in one place: GitHub, repo `shivaaam27/shivamparmar`, branch **`main`**.
Your computer and the cloud (Claude Code on the web, Vercel) both work from that same copy,
so you can switch between them at any time. The rule is simple:

> **Pull before you start, push when you're done.**

## 1. First time on your computer

Install once:

- **Git**: https://git-scm.com/downloads
- **Node.js 22** (LTS): https://nodejs.org (the project needs Node 20.9 or newer)
- An editor, e.g. **VS Code**: https://code.visualstudio.com

**Windows, one paste**: open **PowerShell** and paste this. It puts the project in
`Documents\shivamparmar`, installs everything and starts the site at http://localhost:3210.
Running it again later just updates the folder and starts the site.

```
$d = Join-Path ([Environment]::GetFolderPath('MyDocuments')) 'shivamparmar'; if (Test-Path $d) { Set-Location $d; git pull } else { git clone https://github.com/shivaaam27/shivamparmar.git $d; Set-Location $d }; npm.cmd run setup; npm.cmd run dev
```

To work on it with Claude on your computer, open the **Claude** desktop app → **Code** → new
**local** session → choose the `Documents\shivamparmar` folder. The site preview is set up in
`.claude/launch.json`, so you can ask Claude there to "start the preview".

Or step by step, in a terminal:

```
git clone https://github.com/shivaaam27/shivamparmar.git
cd shivamparmar
npm run setup      # installs packages and creates .env.local
npm run dev        # open http://localhost:3210
```

That's it. The whole site works locally without filling in any settings.

### Settings (.env.local), only if you need them

`npm run setup` copies `.env.example` to `.env.local`. It is ignored by git, so your keys never
end up on GitHub. You only need to fill it in to use **/insights** (visitor numbers) locally.
The quickest way is to copy the real values from Vercel:

```
npx vercel login
npx vercel link          # pick the shivamparmar project
npx vercel env pull .env.local
```

## 2. Every time you sit down to work locally

```
git checkout main
git pull                 # get everything done in the cloud since last time
npm install              # only needed if package.json changed; safe to run anyway
npm run dev
```

## 3. When you're done locally

```
git add -A
git commit -m "What I changed"
git push
```

Pushing to `main` updates GitHub, and Vercel redeploys the live site from it automatically.
The next cloud session will start from your changes.

## 4. Working in the cloud (Claude Code)

- A cloud session starts from a fresh copy of GitHub, installs packages by itself
  (see `.claude/settings.json`), and works on a `claude/…` branch.
- When the work is finished, ask Claude to **merge it into `main`** (or open a pull request and
  merge it on GitHub). Anything that stays only on a `claude/…` branch won't show up
  locally when you pull `main`.
- Then on your computer: `git checkout main && git pull`.

To see a cloud branch locally before it's merged:

```
git fetch
git checkout claude/<branch-name>
```

## Where things are

| What                        | Where                                  |
|-----------------------------|----------------------------------------|
| Site text, links, images    | `lib/content.ts`, `lib/work.ts`, `public/` |
| Pages                       | `app/`                                 |
| Components                  | `components/`                          |
| Colours, fonts, spacing     | `app/globals.css`                      |
| Docs and saved ideas        | `docs/`                                |
| Settings template           | `.env.example` (your copy: `.env.local`) |

See `README.md` for how the site is built.

## If something goes wrong

- **`git pull` says you have local changes**: commit them first (step 3), then pull again.
- **`git pull` reports a conflict**: the same lines were changed locally and in the cloud.
  Open the files it names, keep the version you want, remove the `<<<<<<<` / `>>>>>>>` markers,
  then `git add -A && git commit`. Or ask Claude to resolve it.
- **The site won't start after pulling**: run `npm install`, then `npm run dev` again.
- **localhost shows a different site**: this site always runs at **http://localhost:3210**
  (its own port, so it never clashes with other projects on 3000). If the terminal says the port is
  already in use, another copy is still running: close that terminal or press `Ctrl + C` in it.
- **"Node is too old"**: install Node 22 from https://nodejs.org.
