// See https://api.slack.com/interactivity/slash-commands#app_command_handling
function parseRequest(string: string) {
  return Object.fromEntries(
    string.split('&').map((element) => element.split('='))
  )
}

const timeDict: Record<string, Record<string, string>> = {
  locale: {
    kr: '+0900',
    la: '-0800',
  },
}

// [KR | LA] [M] [dd] [hh] [mm] [yyyy]
// [KR | LA] [월] [일] [시] [분] [년]
async function convertTimeFormat(content: string) {
  const args = content.split('+').map((arg) => decodeURIComponent(arg))
  const locale = timeDict.locale[args[0].toLowerCase()]
  let [_, month, day, hour, minute, year] = args.map((arg) =>
    arg?.replace(/월|일|시|분|년/g, '')
  )

  minute ??= '00'
  year ??= `${new Date().getFullYear()}`

  const dateStr = `${month} ${day} ${year} ${hour}:${minute}:00 GMT${locale}`
  const date = new Date(dateStr)
  // epoch to seconds
  const epoch = date.getTime() / 1000
  if (isNaN(epoch)) {
    return { locale, month, day, hour, minute, year }
  }
  return epoch
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const reqObj = parseRequest(rawBody)
    const { text, command } = reqObj

    if (command === '%2Ftime') {
      const epoch = await convertTimeFormat(text)
      if (typeof epoch !== 'number') {
        const mkd = '```'
        const errResponse = {
          response_type: 'in_channel',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '입력되지 않은 값이 있습니다:',
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `${mkd}${JSON.stringify(
                  epoch,
                  (_key, value) => {
                    if (typeof value === 'undefined') {
                      return '__undefined__'
                    }
                    return value
                  },
                  2
                )}${mkd}`,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: '*예시* : /time (kr | la) 12월 25일 14시 30분 2022년 <-- 분, 년도는 생략 가능합니다.',
              },
            },
          ],
        }
        return new Response(JSON.stringify(errResponse), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      }

      const response = {
        response_type: 'in_channel',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `<!date^${epoch}^{date_long_pretty} {time}|${new Date().toUTCString()}>`,
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
    const errResponse = {
      response_type: 'in_channel',
      text: `*예시* : /time (kr | la) 12월 25일 14시 | 30분 2022 <-- 분, 년도는 생략 가능합니다.`,
    }
    return new Response(JSON.stringify(errResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
