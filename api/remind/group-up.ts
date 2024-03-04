import VercelCronLogger from 'vercel-cron-logger'
import { getMinuteUntil } from './_utils'
import { sendReminder } from '../_chat'

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')

  // See https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    const targetTime = 9 // 09:00 UTC
    const timeUntilStandUp = getMinuteUntil(targetTime)
    await sendReminder(`${timeUntilStandUp}분 뒤 몰입 세션이 시작됩니다. 😌`)

    await VercelCronLogger(request)
    return new Response('Success!', { status: 200 })
  }

  return new Response('Unauthorized.', { status: 401 })
}
