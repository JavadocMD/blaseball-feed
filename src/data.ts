import * as Rx from 'rxjs'

export type Data = any // TODO: gameDataUpdate object
export type Game = any // TODO: one entry in the schedules array

/** A data source for game updates. */
export type Feed = {
  /** Stream for game update data. */
  readonly data: Rx.Observable<Data>
  /** Stream for log messages about the feed's operation. */
  readonly log: Rx.Observable<string>
  /** Close the source. */
  close(): void
}

export const filter = Object.freeze({
  teamGame: (team: string) => (data: Data): Game | undefined => {
    return data.schedule.find((x: any) => x.awayTeamName === team || x.homeTeamName === team)
  },
  gameUpdate: (team: string) => (game: Game | undefined): string => {
    return game ? game.lastUpdate : `No game found for team "${team}"`
  },
})
