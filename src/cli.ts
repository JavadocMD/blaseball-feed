import * as R from 'rxjs/operators'
import yargs from 'yargs'
import { filter } from './data'
import { BlaseballSocket } from './socket'

function main() {
  const { quiet, team } = yargs
    // quiet
    .boolean('quiet')
    .default('quiet', false)
    // team
    .string('team')
    .demandOption('team')
    // ...
    .describe({
      quiet: 'disable extraneous logging output (e.g., connection/disconnection messages)',
      team: 'the team to follow',
    })
    .alias({
      quiet: ['q'],
      team: ['t'],
    })
    .example('$0 -t "Mexico City Wild Wings"', 'Follow live updates to the Wild Wings game.').argv

  const feed = BlaseballSocket.listen()

  if (quiet !== true) {
    feed.log.subscribe(console.log)
  }

  feed.data
    .pipe(R.map(filter.teamGame(team)))
    .pipe(R.map(filter.gameUpdate(team)))
    .pipe(R.distinctUntilChanged())
    .subscribe(console.log)

  process.on('SIGINT', () => {
    feed.close()
    process.exit()
  })
}

main()
