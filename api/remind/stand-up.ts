import { sendReminder } from '../_chat'
import { cronJobLogger } from '../_utils'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')

  // See https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    await sendReminder('30분 뒤 스탠드업 미팅이 시작됩니다. 🤓')
    await cronJobLogger()
    return new Response('Success!', { status: 200 })
  }

  return new Response('Unauthorized.', { status: 401 })
}
