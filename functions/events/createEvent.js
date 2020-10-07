require('dotenv').config()
const { MongoClient } = require('mongodb')
const mongo = new MongoClient(process.env.MONGODB_URL, {
  useUnifiedTopology: true
})
const OpenTok = require('opentok')
const OT = new OpenTok(process.env.VONAGE_API_KEY, process.env.VONAGE_API_SECRET)

module.exports = async (event, context) => {
  try {
    const { name, tables, code, speaker, welcome } = JSON.parse(event.body)
    await mongo.connect()
    const events = await mongo.db('production').collection('events')
    if (await events.findOne({ code })) {
      return {
        statusCode: 200,
        body: JSON.stringify({ error: 'That event code already exists!' })
      }
    } else {
      const sessions = []
      for (let i = 1; i <= tables; i++) {
        sessions.push(await createSession(i))
      }
      await events.insertOne({
        name,
        code,
        speaker,
        tables: sessions,
        welcome,
        stage: await createSession()
      })
    }
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Successfully created event' })
    }
  } catch (err) {
    console.log(err)
    return { statusCode: 500, body: err.toString() }
  }
}

const createSession = async i => {
  return new Promise((resolve, reject) => {
    OT.createSession((error, session) => {
      resolve({
        name: i ? 'Table ' + i : 'Stage',
        id: session.sessionId,
        members: []
      })
    })
  })
}
