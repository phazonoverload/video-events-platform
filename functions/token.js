require('dotenv').config()
const OpenTok = require('opentok')
const OT = new OpenTok(
  process.env.VONAGE_API_KEY,
  process.env.VONAGE_API_SECRET
)

exports.handler = async event => {
  const { session, name } = JSON.parse(event.body)
  const token = OT.generateToken(session, {
    role: 'publisher',
    data: `name=${name}`
  })
  return {
    statusCode: 200,
    body: JSON.stringify({
      token,
      session,
      apiKey: process.env.VONAGE_API_KEY
    })
  }
}
