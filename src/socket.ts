import * as Rx from 'rxjs'
import * as R from 'rxjs/operators'
import { default as createSocket } from 'socket.io-client'
import { Data, Feed } from './data'

/** A Feed for the live blaseball data. */
export class BlaseballSocket implements Feed {
  public static listen() {
    const socket = createSocket('https://blaseball.com')
    return new BlaseballSocket(socket)
  }

  public readonly data: Rx.Observable<Data>
  public readonly log: Rx.Observable<string>

  private constructor(private readonly socket: SocketIOClient.Socket) {
    // Log events.
    const conx = Rx.fromEvent<void>(socket, 'connect') //
      .pipe(R.map(() => 'connected'))

    const disx = Rx.fromEvent<string>(socket, 'disconnect') //
      .pipe(R.map(reason => `disconnected (${reason})`))

    this.log = Rx.merge(conx, disx)

    // Data events. TODO: parse data
    this.data = Rx.fromEvent<Data>(socket, 'gameDataUpdate') //
      .pipe(R.distinctUntilChanged())
  }

  public close() {
    this.socket.close()
  }
}
