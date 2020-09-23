require('dotenv').config()
const { MongoClient } = require('mongodb')
const mongo = new MongoClient(process.env.MONGODB_URL, {
  useUnifiedTopology: true
})

module.exports = async (event, context) => {
  try {
    await mongo.connect()
    const events = await mongo.db('production').collection('events')
    const singleEvent = await events.findOne({
      code: event.queryStringParameters.code
    })
    if (singleEvent) {
      return { statusCode: 200, body: JSON.stringify(singleEvent) }
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({ error: 'No event with that code was found' })
      }
    }
  } catch (err) {
    return { statusCode: 500, body: err.toString() }
  }
}

const createSession = async i => {
  return new Promise((resolve, reject) => {
    OT.createSession((error, session) => {
      resolve({
        name: 'Table ' + (i + 1),
        id: session.sessionId
      })
    })
  })
}
