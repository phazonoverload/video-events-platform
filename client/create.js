const app = new Vue({
  el: '#app',
  data: {
    event: {}
  },
  methods: {
    async createEvent() {
      const { name, code, tables, speaker } = this.event
      if (!name || !code || !tables || !speaker)
        return alert('You must fill in all fields')
      fetch('/api/events', {
        method: 'POST',
        body: JSON.stringify(this.event)
      })
        .then(r => r.json())
        .then(res => {
          if (res.error) return alert(res.error)
          alert(res.message)
        })
    }
  }
})
