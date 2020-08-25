import * as R from 'rxjs/operators'
import yargs from 'yargs'
import { Feed, filter } from './data'
import * as BlaseballLive from './live'
import * as BlaseballStream from './stream'

function parseArgs() {
  return (
    yargs
      // quiet
      .boolean('quiet')
      .default('quiet', false)
      // use stdin?
      .boolean('stdin')
      .default('stdin', false)
      // team
      .string('team')
      .demandOption('team')
      // ...
      .describe({
        quiet: 'disable extraneous logging output (e.g., connection/disconnection messages)',
        stdin: 'read input from stdin instead of the Blaseball live event stream',
        team: 'the team to follow',
      })
      .alias({
        quiet: ['q'],
        stdin: ['s'],
        team: ['t'],
      })
      .example('$0 -t "Mexico City Wild Wings"', 'Follow live updates to the Wild Wings game.').argv
  )
}

type Args = ReturnType<typeof parseArgs>

function createFeed(stdin: Args['input']): Feed {
  if (stdin === true) {
    return BlaseballStream.listen(process.stdin)
  } else {
    return BlaseballLive.listen()
  }
}

function main() {
  const { quiet, stdin, team } = parseArgs()

  function output(data: string): void {
    process.stdout.write(data)
    process.stdout.write('\n')
  }

  const feed = createFeed(stdin)

  if (quiet !== true) {
    feed.log.subscribe(output)
  }

  feed.data
    .pipe(R.map(filter.teamGame(team)))
    .pipe(R.map(filter.gameUpdate(team)))
    .pipe(R.distinctUntilChanged())
    .subscribe(output)

  function terminate() {
    feed.close()
  }

  // Terminate:
  // - on output error
  process.stdout.on('error', terminate)
  // - on SIGINT (TODO: check SIGINT handling on non-Linux platforms)
  process.on('SIGINT', terminate)
}

main()
