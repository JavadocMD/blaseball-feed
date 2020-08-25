import * as Rx from 'rxjs'
import * as R from 'rxjs/operators'
import { Transform } from 'stream'
import { StringDecoder } from 'string_decoder'
import { Data, Feed } from './data'

/** Transform stream which splits the input on newlines. */
export const split = (delay = 500, r = /\r?\n/) => {
  const enc = 'utf8'
  const dec = new StringDecoder(enc)

  function send(data: Array<string>, push: (s: string) => void, callback: () => void) {
    if (data.length === 0) {
      callback()
      return
    }
    const [head, ...tail] = data
    if (delay > 0) {
      setTimeout(() => {
        push(head)
        send(tail, push, callback)
      }, delay)
    } else {
      push(head)
      send(tail, push, callback)
    }
  }

  let prev: string = ''
  return new Transform({
    defaultEncoding: enc,
    transform(chunk, e, callback) {
      if ((e as any) !== 'buffer') {
        callback(new Error(`split expected a buffer, but got ${e}`))
        return
      }
      const xs = (prev + dec.write(chunk)).split(r)
      // The trailing item might not be complete yet. Hold it.
      prev = xs.pop() as string // CAST: array must be non-empty
      send(xs, this.push.bind(this), callback)
    },
    flush(callback) {
      const x = prev + dec.end()
      this.push(x)
      callback()
    },
  })
}

/** A Feed for the live blaseball data. */
export class InputStream implements Feed {
  public readonly data: Rx.Observable<Data>
  public readonly log: Rx.Observable<string>

  public constructor(private readonly stream: NodeJS.ReadableStream) {
    // Log events.
    this.log = Rx.empty()

    // Data events.
    const output = new Rx.Subject<Data>()
    this.data = output.asObservable().pipe(R.distinctUntilChanged())

    // Start listening to the stream, publishing through to the data observable.
    stream
      .pipe(split())
      .on('data', s => output.next(JSON.parse(s)))
      .on('end', () => output.complete())
      .on('close', () => output.complete())
      .on('error', error => output.error(error))
  }

  public close() {
    this.stream.unpipe()
  }
}
