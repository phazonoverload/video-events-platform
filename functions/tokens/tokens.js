const createTableToken = require('./createTableToken')
const createAudienceToken = require('./createAudienceToken')
const createSpeakerToken = require('./createSpeakerToken')

exports.handler = async event => {
  const { session, stage, password } = JSON.parse(event.body)
  if (!stage && !password) return await createTableToken(event)
  if (stage && !password) return await createAudienceToken(event)
  if (stage && password) return await createSpeakerToken(event)
}
