import { EventSource } from 'launchdarkly-eventsource'
import * as Rx from 'rxjs'
import * as R from 'rxjs/operators'
import { Data, Feed } from './data'

/** A Feed for the live blaseball data. */
export function listen(): Feed {
  const source = new EventSource('https://www.blaseball.com/events/streamData', {
    initialRetryDelayMillis: 2000,
    maxBackoffMillis: 5000,
    errorFilter: function errorFilter() {
      return true
    },
  })

  // Log events.
  const open = Rx.fromEvent<void>(source, 'open') //
    .pipe(R.map(() => 'connected'))

  const error = Rx.fromEvent<string>(source, 'error') //
    .pipe(R.map(reason => `error (${JSON.stringify(reason)})`))

  const log = Rx.merge(open, error)

  // Data events. TODO: parse data
  const data = Rx.fromEvent<Data>(source, 'message') //
    .pipe(R.map(e => JSON.parse(e.data).value.games))
    .pipe(R.distinctUntilChanged())

  return {
    log,
    data,
    close: () => {
      source.close()
    },
  }
}
