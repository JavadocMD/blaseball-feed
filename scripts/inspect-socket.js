const { EventSource } = require('launchdarkly-eventsource')

console.log('Connecting...')

const src = new EventSource('https://www.blaseball.com/events/streamData', {
  initialRetryDelayMillis: 2000,
  maxBackoffMillis: 5000,
  errorFilter: function errorFilter() {
    return true
  },
})

src.on('open', msg => {
  console.log('Connected.')
})
src.on('message', e => {
  // console.log(e.data.substring(0, 80))
  console.log(e.data)
})
src.on('error', e => {
  console.log(e)
})

process.on('SIGINT', () => {
  src.close()
})
