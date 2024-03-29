# DKRM Slackbot

![Screenshot of usage of this project](https://github.com/devjiwonchoi/vercel-ai-slackbot/assets/120007119/eb71cacc-573c-43e5-9cb3-089850957dd6)

> Note: The bot name and icon customizable at your [Slack Apps](https://api.slack.com/apps).

## Getting Started

### Deploy on Vercel

Click on the button below to deploy this project on Vercel:

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/devjiwonchoi/vercel-ai-slackbot&env=OPENAI_API_KEY,SLACK_BOT_TOKEN,SLACK_SIGNING_SECRET)

Fill in the [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) retrieved from the following steps and click on "Deploy".

### Environment Variables

#### OpenAI API Key

- Create a new key on [OpenAI API Keys](https://platform.openai.com/api-keys) and "Create new secret key", optionally naming the key.
- Add the key to Vercel's environment variables as `OPENAI_API_KEY`.

#### Slack Bot Token & Signing Secret

Go to [Slack API Apps Page](https://api.slack.com/apps):

- Create new App
  - From Scratch
  - Name your app & pick a workspace
- Go to Oauth & Permissions
  - Add the following scopes
    - `app_mentions:read`
    - `channels:history`
    - `chat:write`
    - `commands`
  - Copy **Bot User OAuth Token**
  - Add the token to Vercel's environment variables as `SLACK_BOT_TOKEN`
- Install App to workspace
  - Basic Information --> Install Your App --> Install To Workspace
  - App Credentials --> Coppy **Signing Secret**
  - Add the secret to Vercel's environment variables as `SLACK_SIGNING_SECRET`

#### `CRON_SECRET`

- [Secret key to secure your cron job invocations](https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs)

### Enable Slack Events

After successfully deploying the app, go to [Slack API Apps Page](https://api.slack.com/apps) and select your app:

- Go to **Event Subscriptions** and enable events.
- Add the following URL to **Request URL**:
  - `https://<your-vercel-app>.vercel.app/api/events`
  - Make sure the URL is verified, otherwise check out [Vercel Logs](https://vercel.com/docs/observability/runtime-logs) for troubleshooting.
  - If verified, make sure to click **Save Changes**.
- After these changes, Slack may require reinstalling of the app.

### Cron Job Schedule (UTC)

You can modify the cron job schedule in [`vercel.json`](./vercel.json) through the [cron expressions](https://vercel.com/docs/cron-jobs#cron-expressions):

```json
{
  "crons": [
    {
      "path": "/api/remind/group-up",
      "schedule": "30 08 * * 0"
    },
  ]
}
```

> This cron job is scheduled to run every Sunday at 08:30 (UTC).

We recommend you to use [crontab guru](https://crontab.guru) to generate your cron expressions.

## Local Development

Use [Vercel CLI](https://vercel.com/docs/cli) and [localtunnel](https://github.com/localtunnel/localtunnel) to test out this project locally:

```sh
pnpm install
pnpm vercel dev --listen 3000 --yes
```

```sh
npx localtunnel --port 3000
```

Make sure to modify the [subscription URL](./README.md/#enable-slack-events) to the `localtunnel` URL.
