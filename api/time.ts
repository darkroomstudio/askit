import { ChatCompletionMessageParam } from 'openai/resources'
import { getGPTStream } from './_openai'

// See https://api.slack.com/interactivity/slash-commands#app_command_handling
function parseRequest(string: string) {
  return Object.fromEntries(
    string.split('&').map((element) => element.split('='))
  )
}

const timeDict: Record<string, Record<string, string>> = {
  locale: {
    kr: '+0900',
    us: '-0800',
  },
}

// kr 3월 10일 18시 30분
// kr 3 10 18 30

// [KR | LA] [M] [dd] [hh] [mm] [yyyy]
// [KR | LA] [월] [일] [시] [분] [년]
async function convertTimeFormat(content: string) {
  // arg to allow only number except for locale
  const args = content.split('+')
  const locale = timeDict.locale[args[0].toLowerCase()] ?? null

  console.log({ args, locale })

  const month = args[1].replace('월', '') ?? null
  const day = args[2].replace('일', '') ?? null
  const hour = args[3].replace('시', '') ?? null
  const minute = args[4] ?? '00'
  const year = args[5] ?? new Date().getFullYear()

  if (!locale || !month || !day || !hour) {
    const err = new Error(`Invalid time format: content=${content}`)
    err.name = 'WRONG_TIME_FORMAT'
    throw err
  }

  console.log({ month, day, hour, minute, year, locale })

  const dateStr = `${month} ${day} ${year} ${hour}:${minute}:00 GMT${locale}`
  const date = new Date(dateStr)
  // to seconds
  return date.getTime() / 1000
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const reqObj = parseRequest(rawBody)
    const { text, command } = reqObj

    if (command === '%2Ftime') {
      const convertedEpochTime = await convertTimeFormat(text)
      const response = {
        response_type: 'in_channel',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `<!date^${convertedEpochTime}^{date_long_pretty} {time}|${new Date().toUTCString()}>`,
            },
          },
        ],
      }

      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    return new Response('Not Found', { status: 404 })
  } catch (error) {
    if (error instanceof Error && error.name.includes('WRONG_TIME_FORMAT')) {
      const errResArray = [
        '시간을 잘못 입력하신 것 같은데... 공지 잘 확인 해주세요 🙏🏻',
        '시계는 볼 줄 아시죠? 제대로 입력해주세요 😅',
        '...시간을 잘못 입력하신 것 같은데요? 다시 확인해주세요 🤔',
        '음... 시간이... 잘못... zzz 😴',
      ]
      const randomErrResponse =
        errResArray[Math.floor(Math.random() * errResArray.length)]

      const errResponse = {
        response_type: 'in_channel',
        text: randomErrResponse,
      }
      return new Response(JSON.stringify(errResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    console.error(error)
    const errResArray = [
      '물 떠오느라',
      '엄마가 불러서',
      '잠깐 졸아서',
      '지금 롤 중이라',
    ]
    const randomErrResponse =
      errResArray[Math.floor(Math.random() * errResArray.length)]
    const errResponse = {
      response_type: 'in_channel',
      text: `${randomErrResponse} 못봤어요. 뭐라고요? 다시 말해주세요. 😆`,
    }
    return new Response(JSON.stringify(errResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
