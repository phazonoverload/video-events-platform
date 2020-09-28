// TODO: Three variants - room, stage as speaker, stage as participant

require('dotenv').config()
const { MongoClient } = require('mongodb')
const mongo = new MongoClient(process.env.MONGODB_URL, {
  useUnifiedTopology: true
})
const OpenTok = require('opentok')
const OT = new OpenTok(
  process.env.VONAGE_API_KEY,
  process.env.VONAGE_API_SECRET
)

exports.handler = async event => {
  const { session, password } = JSON.parse(event.body)
  await mongo.connect()
  const events = await mongo.db('production').collection('events')

  const eventWithStage = await events.findOne({
    'stage.id': session
  })

  let token
  if (eventWithStage) {
    if (password) {
      if (eventWithStage.speaker == password) {
        token = OT.generateToken(session, {
          role: 'publisher'
        })
        console.log('Token is to publish on the stage')
      } else {
        return {
          statusCode: 200,
          body: JSON.stringify({ error: 'Speaker access code was incorrect' })
        }
      }
    } else {
      token = OT.generateToken(session, {
        role: 'subscriber'
      })
    }
  } else {
    token = OT.generateToken(session, {
      role: 'publisher'
    })
    console.log('Token is to publish on a table')
  }
  return {
    statusCode: 200,
    body: JSON.stringify({
      token,
      session,
      apiKey: process.env.VONAGE_API_KEY
    })
  }
}
