import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources'

const openai = new OpenAI() // process.env.OPENAI_API_KEY

export async function getGPTResponse(prompt: ChatCompletionMessageParam[]) {
  return await openai.chat.completions.create({
    model: 'gpt-4',
    messages: prompt,
  })
}

export async function handleThreadHistory({ messages }: any) {
  const botID = messages[0].reply_users[0]
  return messages
    .map((message: any) => {
      const isBot = !!message.bot_id && !message.client_msg_id
      const isNotMentioned = !isBot && !message.text.includes(`<@${botID}>`)

      if (isNotMentioned) return null

      return {
        role: isBot ? 'assistant' : 'user',
        content: isBot
          ? message.text
          : message.text.replace(`<@${botID}> `, ''),
      }
    })
    .filter(Boolean)
}
