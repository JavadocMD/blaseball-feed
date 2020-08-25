import * as Rx from 'rxjs'
import * as R from 'rxjs/operators'
import { EventSource } from 'launchdarkly-eventsource'
import { Data, Feed } from './data'

/** A Feed for the live blaseball data. */
export class BlaseballSocket implements Feed {
  public static listen() {
    const source = new EventSource('https://www.blaseball.com/events/streamGameData', {
      initialRetryDelayMillis: 2000,
      maxBackoffMillis: 5000,
      errorFilter: function errorFilter() {
        return true
      },
    })
    return new BlaseballSocket(source)
  }

  public readonly data: Rx.Observable<Data>
  public readonly log: Rx.Observable<string>

  private constructor(private readonly source: EventSource) {
    // Log events.
    const open = Rx.fromEvent<void>(source, 'open') //
      .pipe(R.map(() => 'connected'))

    const error = Rx.fromEvent<string>(source, 'error') //
      .pipe(R.map(reason => `error (${JSON.stringify(reason)})`))

    this.log = Rx.merge(open, error)

    // Data events. TODO: parse data
    this.data = Rx.fromEvent<Data>(source, 'message') //
      .pipe(R.map(e => JSON.parse(e.data).value))
      .pipe(R.distinctUntilChanged())
  }

  public close() {
    this.source.close()
  }
}
