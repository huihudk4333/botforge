# Discord Bot — Welcome, Tickets, Embeds

Three features in one bot:
- **Welcome messages** — posts an embed when someone joins your server
- **Ticket system** — `/ticket-panel` posts a dropdown; picking a category opens a
  private ticket channel with Claim/Close buttons and auto-transcripts
- **Custom embeds** — `/embed` lets staff post their own embed messages

## Deploy it (GitHub + Railway — no local install needed)

### 1. Create your Discord application
1. Go to https://discord.com/developers/applications → **New Application**
2. **Bot** tab → **Reset Token** → copy it somewhere safe (you'll need it in step 4)
3. Under **Privileged Gateway Intents**, turn ON **Server Members Intent**
4. **General Information** tab → copy the **Application ID** (this is your Client ID)
5. **OAuth2 → URL Generator** → check scopes `bot` + `applications.commands` → check
   permissions: Manage Channels, Send Messages, Embed Links, Attach Files, Read Message
   History, Manage Roles → copy the generated URL → open it in a new tab → invite the bot
   to your server

### 2. Upload this project to GitHub
1. Go to github.com → **+** → **New repository** → name it, set **Private**, create it
2. On the empty repo page, go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/upload/main`
3. Upload every file/folder in this project **except** `.env` and `node_modules` (there
   shouldn't be either in this download — just drag in everything you see)
4. Click **Commit changes**

### 3. Deploy on Railway
1. Go to railway.app → **Login with GitHub**
2. **New Project** → **Deploy from GitHub repo** → select your repo
3. Click the deployed service → **Variables** tab → **New Variable**, add:
   - `DISCORD_TOKEN` → your bot token
   - `CLIENT_ID` → your Application ID
   - `GUILD_ID` → your server ID (Discord → Developer Mode on → right-click your
     server icon → Copy Server ID)
4. Railway redeploys automatically. Click **Deployments** → latest one → check the logs
   for `✅ Logged in as YourBotName`

### 4. Register the slash commands (one-time, from your own computer or Railway won't do this for you)
Slash commands need to be registered once via `deploy-commands.js`. Easiest way if you
don't want to install Node locally: temporarily change the **Start Command** in Railway
**Settings** to:
```
npm run deploy && npm start
```
Deploy once, check the logs for `✅ Deployed commands to guild ...`, then change the
Start Command back to just `npm start` and redeploy. (You only need to do this again if
you add/rename a slash command later.)

### 5. Configure `config.json`
On GitHub, open `config.json`, click the pencil to edit, and fill in (right-click each
in Discord with Developer Mode on to copy its ID):
```json
"supportRoleIds": ["your_support_role_id"],
"ticketCategoryId": "your_ticket_category_id",
"transcriptLogChannelId": "your_log_channel_id",
"welcomeChannelId": "your_welcome_channel_id",
"welcomeMessage": "Welcome {user} to {server}! We hope you enjoy your stay.",
```
`{user}` and `{server}` in the welcome message get replaced automatically. Commit
changes — Railway redeploys automatically.

### 6. Post the ticket panel
In your Discord server, type `/ticket-panel` in any channel (needs Manage Channels
permission). It posts the dropdown embed people use to open tickets.

## Customizing

**Ticket categories, panel text, colors** — all in `config.json` under `"panel"` and
`"categories"`. Edit values between the quotes only; keep every comma and quote mark
in place, or the file won't load.

**Bot status text** ("Watching ...") — in `events/ready.js`:
```javascript
client.user.setActivity('for /ticket-panel', { type: 3 });
```
Change the text in quotes to whatever you want it to say.

**Custom embeds** — use `/embed title:... description:... color:#5865F2 footer:...
image:...` (only title and description are required).

## File structure
```
discord-bot/
├── index.js              # entry point
├── deploy-commands.js    # registers slash commands (one-time / when adding new ones)
├── config.json           # categories, roles, channels, welcome message — edit this
├── commands/
│   ├── panel.js           # /ticket-panel
│   ├── close.js           # /close [reason]
│   └── embed.js           # /embed
├── events/
│   ├── ready.js
│   ├── guildMemberAdd.js   # welcome message on join
│   └── interactionCreate.js
└── utils/
    ├── ticketManager.js
    └── transcript.js
```

## Notes
- Ticket ownership is tracked via the channel's topic field — no database needed.
- Closed ticket channels auto-delete a few seconds after closing (`closeCountdownSeconds`
  in config.json); a transcript is sent to your log channel and DM'd to the user first.
- Never share your `DISCORD_TOKEN` anywhere public. If it's ever exposed, reset it
  immediately at Discord Developer Portal → Bot → Reset Token, then update it in
  Railway's Variables tab.
