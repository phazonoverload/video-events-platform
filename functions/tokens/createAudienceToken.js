require('dotenv').config()
const OpenTok = require('opentok')
const OT = new OpenTok(process.env.VONAGE_API_KEY, process.env.VONAGE_API_SECRET)

module.exports = async (event, context) => {
  const { session } = JSON.parse(event.body)
  return {
    statusCode: 200,
    body: JSON.stringify({
      apiKey: process.env.VONAGE_API_KEY,
      session,
      token: OT.generateToken(session, { role: 'subscriber' })
    })
  }
}
