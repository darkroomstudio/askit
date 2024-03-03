import { WebClient } from '@slack/web-api'
import { getGPTResponse, generatePromptFromThread } from './_openai'

const slack = new WebClient(process.env.SLACK_BOT_TOKEN)

type SlackEvent = {
  channel: string
  ts: string
  thread_ts?: string
}

export async function sendGPTResponse({ channel, ts, thread_ts }: SlackEvent) {
  try {
    const thread = await slack.conversations.replies({
      channel,
      ts: thread_ts ?? ts,
      inclusive: true,
    })

    const prompts = await generatePromptFromThread(thread)
    const gptResponse = await getGPTResponse(prompts)

    await slack.chat.postMessage({
      channel,
      thread_ts: ts,
      text: `${gptResponse.choices[0].message.content}`,
    })
  } catch (error) {
    // See Vercel Runtime Logs for errors: https://vercel.com/docs/observability/runtime-logs
    console.error(error)
    throw error
  }
}

export async function sendReminder(message: string) {
  if (!process.env.SLACK_TARGET_CHANNEL) {
    throw new Error('SLACK_TARGET_CHANNEL is not defined')
  }

  try {
    await slack.chat.postMessage({
      channel: process.env.SLACK_TARGET_CHANNEL,
      text: message,
    })
  } catch (error) {
    console.error(error)
    throw error
  }
}