import * as Rx from 'rxjs'
import * as R from 'rxjs/operators'
import { Transform } from 'stream'
import { StringDecoder } from 'string_decoder'
import { Data, Feed } from './data'

/** Transform stream which splits the input on newlines. */
function split(delay = 500, r = /\r?\n/): Transform {
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

/** A Feed for blaseball data from a stream. */
export function listen(stream: NodeJS.ReadableStream): Feed {
  // Data events.
  const output = new Rx.Subject<Data>()
  const data = output.asObservable().pipe(R.distinctUntilChanged())

  // Start listening to the stream, publishing through to the data observable.
  stream
    .pipe(split())
    .on('data', s => output.next(JSON.parse(s)))
    .on('end', () => output.complete())
    .on('close', () => output.complete())
    .on('error', error => output.error(error))

  return {
    log: Rx.empty(), // No relevant log events.
    data,
    close: () => {
      stream.unpipe()
    },
  }
}
