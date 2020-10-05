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
    onStage: false,
    publishers: [],
    subscribers: [],
    stage: {
      publishers: [],
      subscribers: [],
      accessed: false
    }
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
    async joinTable(id, password = false) {
      const { token, session, apiKey } = await this.createToken(id)
      this.session = OT.initSession(apiKey, session)
      this.createPublisher(token)
      this.session.on('streamCreated', this.streamCreated)
    },
    createPublisher(token, el = 'publisher') {
      this.publishers.push(OT.initPublisher(el, { name: this.username }))
      this.session.connect(token, err => {
        if (err) return console.error(err)
        this.session.publish(this.publishers[0])
      })
    },
    streamCreated(event, el = 'subscribers') {
      this.subscribers.push(event.stream)
      console.log(event)
      this.session.subscribe(event.stream, el, {
        nameDisplayMode: 'on'
      })
    },
    async leaveTable() {
      this.session.disconnect()
      this.session = false
      this.onStage = false
      for (let i in this.publishers) {
        this.publishers[i].destroy()
        this.publishers.splice(i, 1)
      }
    },
    async enterStage(event, speaker = false) {
      if (!speaker) {
        const { token, session, apiKey, error } = await this.createToken(this.event.stage.id, 'stage')
        this.session = OT.initSession(apiKey, session)
        this.session.connect(token)
        this.session.on('streamCreated', event => {
          this.streamCreated(event, 'stage-subscribers')
        })
        this.onStage = true
      } else {
        const password = prompt('Speaker access code')
        const { token, session, apiKey, error } = await this.createToken(this.event.stage.id, 'stage', password)
        if (error) {
          return alert(error)
        } else {
          this.session = OT.initSession(apiKey, session)
          const camera = this.createPublisher(token, 'stage-publishers')
          this.session.connect(token, () => {
            this.session.publish(camera)
          })
          this.session.on('streamCreated', event => {
            this.streamCreated(event, 'stage-subscribers')
          })
          this.onStage = true
        }
      }
    }
  }
})
