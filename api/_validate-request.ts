import crypto from 'crypto'

const signingSecret = process.env.SLACK_SIGNING_SECRET!

// See https://api.slack.com/authentication/verifying-requests-from-slack
export async function isValidSlackRequest({
  request,
  rawBody,
}: {
  request: Request
  rawBody: string
}) {
  const timestamp = request.headers.get('X-Slack-Request-Timestamp')
  const slackSignature = request.headers.get('X-Slack-Signature')

  if (!timestamp || !slackSignature) {
    return false
  }

  // Prevent replay attacks on the order of 1 minutes
  if (Math.abs(Date.now() / 1000 - parseInt(timestamp)) > 60 * 1) {
    return false
  }

  const base = `v0:${timestamp}:${rawBody}`
  const hmac = crypto
    .createHmac('sha256', signingSecret)
    .update(base)
    .digest('hex')
  const computedSignature = `v0=${hmac}`

  computedSignature === slackSignature
}
