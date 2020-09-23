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
        this.username = prompt('What is your name?')
      }
    } else {
      alert('404') // TODO: Push to 404
    }
  },
  data: {
    event: false,
    session: false,
    username: false
  },
  methods: {
    createToken(session) {
      return new Promise(async (resolve, reject) => {
        const data = await fetch('/api/token', {
          method: 'POST',
          body: JSON.stringify({ session, name: this.username })
        }).then(r => r.json())
        resolve(data)
      })
    },
    async joinTable(id) {
      const { token, session, apiKey } = await this.createToken(id)
      this.session = OT.initSession(apiKey, session)
    },
    async leaveTable() {
      this.session.disconnect()
      this.session = false
    }
  }
})
