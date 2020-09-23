const createEvent = require('./createEvent')
const getEvent = require('./getEvent')

exports.handler = async event => {
  if (event.httpMethod == 'POST') return await createEvent(event)
  if (event.httpMethod == 'GET') return await getEvent(event)
}
