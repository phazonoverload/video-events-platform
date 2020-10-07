const app = new Vue({
  el: '#app',
  async created() {
    if (location.search) {
      const code = location.search.split('=')[1]
      const event = await fetch('/api/events?code=' + code).then(r => r.json())
      if (event.error) {
        alert('404') // TODO: Push to 404
      } else {
        this.event = event
        // this.username = prompt('What is your name?')
        this.username = 'Kevin'
      }
    } else {
      alert('404') // TODO: Push to 404
    }
  },
  data: {
    event: false,
    session: false,
    username: false,
    speaker: false,
    view: 'lobby', // 'lobby', 'table', 'stage'
    publishers: [],
    subscribers: []
  },
  methods: {
    createToken(session, stage = false, password = false) {
      return new Promise(async (resolve, reject) => {
        const data = await fetch('/api/tokens', {
          method: 'POST',
          body: JSON.stringify({ session, stage, password })
        }).then(r => r.json())
        resolve(data)
      })
    },
    createPublisher(el = 'publishers') {
      Vue.nextTick(() => {
        const publisher = OT.initPublisher(el, { name: this.username })
        this.publishers.push(publisher)
        this.session.publish(this.publishers[this.publishers.length - 1])
      })
    },
    connectToSession(apiKey, session, token) {
      return new Promise((resolve, reject) => {
        this.session = OT.initSession(apiKey, session)
        this.session.connect(token, err => {
          this.streamCreated()
          err ? reject(err) : resolve()
        })
      })
    },
    streamCreated(event, el = 'subscribers') {
      this.session.on('streamCreated', event => {
        this.subscribers.push(event.stream)
        this.session.subscribe(event.stream, el, {
          nameDisplayMode: 'on'
        })
      })
      this.session.on('streamDestroyed', event => {
        this.subscribers = this.subscribers.filter(s => s.id != event.stream.id)
      })
    },
    async joinTable(id) {
      this.view = 'table'
      const { token, session, apiKey } = await this.createToken(id)
      await this.connectToSession(apiKey, session, token)
      this.createPublisher()
    },
    async returnToLobby() {
      this.session.disconnect()
      this.session = false
      this.view = 'lobby'
      for (let i in this.publishers) {
        this.publishers[i].destroy()
        this.publishers.splice(i, 1)
      }
    },
    async enterStage(event, speaker = false) {
      this.view = 'stage'
      const password = speaker ? prompt('Speaker access code') : false
      const { token, session, apiKey, error } = await this.createToken(this.event.stage.id, 'stage', password)
      await this.connectToSession(apiKey, session, token)
      if (password) {
        this.createPublisher()
        this.speaker = true
      }
    }
  }
})
