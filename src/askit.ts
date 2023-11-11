import { App } from '@slack/bolt'
import { getGPTResponse, handleThreadHistory } from './openai'

const slack = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
})

slack.event(
  'app_mention',
  async ({ event: { channel, ts, thread_ts }, client }) => {
    const threadHistory = await client.conversations.replies({
      channel,
      ts: thread_ts ?? ts,
      inclusive: true,
    })

    const prompt = await handleThreadHistory(threadHistory)
    console.log(prompt)
    const gptResponse = await getGPTResponse(prompt)

    await client.chat.postMessage({
      channel,
      thread_ts: ts,
      text: `${gptResponse.choices[0].message.content}`,
    })
  }
)

slack.start()
console.log('⚡️ Bolt app is running!')
