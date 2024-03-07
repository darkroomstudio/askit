import { getGPTStream, generatePromptFromThread } from './_openai'
import { slack } from './_slack'

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
    const stream = await getGPTStream(prompts)

    let isFirstChunk = true
    let initialTs = ''
    let messageText = ''
    let chunkCount = 0

    for await (const chunk of stream) {
      messageText += chunk.choices[0]?.delta?.content

      if (isFirstChunk && messageText) {
        const post = await slack.chat.postMessage({
          channel,
          text: messageText,
          thread_ts: ts,
        })
        isFirstChunk = false
        initialTs = post.ts ?? ''
        continue
      }

      // Update the message every 10 chunks
      if (initialTs && messageText && chunkCount % 10 === 9) {
        await slack.chat.update({
          channel,
          text: messageText,
          ts: initialTs,
          as_user: true,
        })
      }

      chunkCount++
    }

    // Update the message with the final chunk
    const finalChunk = await stream.finalChatCompletion()
    await slack.chat.update({
      channel,
      text: finalChunk.choices[0]?.message?.content ?? messageText,
      ts: initialTs,
      as_user: true,
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
