require('dotenv').config()
const OpenTok = require('opentok')
const OT = new OpenTok(process.env.VONAGE_API_KEY, process.env.VONAGE_API_SECRET)
const { MongoClient } = require('mongodb')
const mongo = new MongoClient(process.env.MONGODB_URL, { useUnifiedTopology: true })

module.exports = async (event, context) => {
  const { session, password } = JSON.parse(event.body)
  await mongo.connect()
  const events = await mongo.db('production').collection('events')
  const singleEvent = await events.findOne({ 'stage.id': session })
  if (singleEvent.speaker == password) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        apiKey: process.env.VONAGE_API_KEY,
        session,
        token: OT.generateToken(session, { role: 'publisher' })
      })
    }
  } else {
    return {
      statusCode: 200,
      body: JSON.stringify({ error: 'Speaker access code was incorrect' })
    }
  }
}
