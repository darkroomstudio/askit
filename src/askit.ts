import { App as Slack } from '@slack/bolt'
import { getGPTResponse, generatePromptFromThread } from './openai'
import type { ChatCompletionMessageParam } from 'openai/resources'

const slack = new Slack({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
})

slack.event(
  'app_mention',
  async ({ event: { channel, ts, thread_ts }, client }) => {
    try {
      const thread = await client.conversations.replies({
        channel,
        ts: thread_ts ?? ts,
        inclusive: true,
      })

      const prompt = await generatePromptFromThread(thread)
      const gptResponse = await getGPTResponse(
        prompt as ChatCompletionMessageParam[]
      )

      await client.chat.postMessage({
        channel,
        thread_ts: ts,
        text: `${gptResponse.choices[0].message.content}`,
      })
    } catch (error) {}
  }
)
slack.start()
