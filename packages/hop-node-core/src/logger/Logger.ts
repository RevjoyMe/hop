import chalk from 'chalk'
import type { ColorName } from 'chalk'

type Options = {
  tag?: string
  prefix?: string
  color: string
}

type AdditionalDataLabel = {
  id?: string
  root?: string
}

enum LogLevels {
  Critical,
  Error,
  Warn,
  Info,
  Log,
  Debug
}

const logLevelColors: { [key: string]: string } = {
  [LogLevels.Critical]: 'red',
  [LogLevels.Error]: 'red',
  [LogLevels.Warn]: 'yellow',
  [LogLevels.Info]: 'blue',
  [LogLevels.Log]: 'white',
  [LogLevels.Debug]: 'white'
}

let logLevel = LogLevels.Debug
export const setLogLevel = (_logLevel: LogLevels | string) => {
  if (typeof _logLevel === 'string') {
    const mapping: { [key: string]: number } = {
      error: LogLevels.Error,
      warn: LogLevels.Warn,
      info: LogLevels.Info,
      debug: LogLevels.Debug
    }
    _logLevel = mapping[_logLevel] as LogLevels
  }
  logLevel = _logLevel as LogLevels
}

export class Logger {
  private readonly tag: string = ''
  private readonly prefix: string = ''
  private readonly options: any = {}
  enabled: boolean = true

  setEnabled (enabled: boolean) {
    this.enabled = enabled
  }

  constructor (
    tag: Partial<Options> | string = '',
    opts: Partial<Options> = {
      color: 'white'
    }
  ) {
    if (tag instanceof Object) {
      opts = tag
      tag = opts.tag ?? ''
    }
    if (opts.prefix) {
      this.prefix = `<${opts.prefix}>`
    }
    if (tag) {
      if (opts.color) {
        const color: ColorName | undefined = opts?.color as any
        if (!color) {
          throw new Error(`invalid color: ${opts.color}`)
        }
        this.tag = chalk[color](`[${tag}]`)
      } else {
        this.tag = `[${tag}]`
      }
    }
    if (process.env.DISABLE_LOGGER) {
      this.enabled = false
    }
    this.options = opts
  }

  create (additionalDataLabel: AdditionalDataLabel): Logger {
    let label: string
    if (additionalDataLabel.id) {
      label = `id: ${additionalDataLabel.id}`
    } else {
      label = `root: ${additionalDataLabel.root}`
    }

    return new Logger(
      this.options.tag,
      Object.assign({}, this.options, {
        prefix: `${this.options.prefix ? `${this.options.prefix} ` : ''}${label}`
      })
    )
  }

  get timestamp (): string {
    return (new Date()).toISOString()
  }

  headers (logLevelEnum: LogLevels): string[] {
    const keys = Object.keys(LogLevels)
    const name = keys[logLevelEnum + keys.length / 2]
    if (!name) {
      throw new Error(`invalid log level: ${logLevelEnum}`)
    }
    const logLevelName = name.toUpperCase()
    const color: ColorName | undefined = logLevelColors?.[logLevelEnum] as any
    if (!color) {
      throw new Error(`invalid color: ${logLevelColors?.[logLevelEnum]}`)
    }
    const coloredLogLevel = chalk[color](
      logLevelName.padEnd(5, ' ')
    )
    return [this.timestamp, coloredLogLevel, this.tag, this.prefix]
  }

  critical = (...input: any[]) => {
    if (!this.enabled) return
    console.error(...this.headers(LogLevels.Critical), ...input)
  }

  debug = (...input: any[]) => {
    if (!this.enabled) return
    if (logLevel !== LogLevels.Debug) {
      return
    }
    console.debug(...this.headers(LogLevels.Debug), ...input)
  }

  error = (...input: any[]) => {
    if (!this.enabled) return
    console.error(...this.headers(LogLevels.Error), ...input)
  }

  info = (...input: any[]) => {
    if (!this.enabled) return
    if (!(logLevel === LogLevels.Debug || logLevel === LogLevels.Info)) {
      return
    }
    console.info(...this.headers(LogLevels.Info), ...input)
  }

  log = (...input: any[]) => {
    if (!this.enabled) return
    if (logLevel < LogLevels.Info) {
      return
    }
    console.log(...this.headers(LogLevels.Log), ...input)
  }

  warn = (...input: any[]) => {
    if (!this.enabled) return
    if (logLevel < LogLevels.Warn) {
      return
    }
    console.warn(...this.headers(LogLevels.Warn), ...input)
  }

  dbOperation = (...input: any[]) => {
    // Explicitly set to true for debugging
    const isEnabled = process.env.DB_LOG_ENABLED === 'true'
    if (!this.enabled || !isEnabled) return
    if (logLevel < LogLevels.Debug) {
      return
    }
    console.warn(...this.headers(LogLevels.Debug), ...input)
  }
}
