import { app } from 'electron'
import {
  appendFileSync,
  mkdirSync,
  renameSync,
  statSync,
  unlinkSync,
  existsSync,
} from 'fs'
import { join } from 'path'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_RANK: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
}

const MAX_FILE_BYTES = 1_000_000
const MAX_BACKUPS = 5
const LOG_FILE_NAME = 'cassanova.log'

type LogFields = Record<string, unknown>

interface LogRecord {
  ts: string
  level: LogLevel
  scope: string
  msg: string
  fields?: LogFields
  err?: { name: string; message: string; stack?: string }
}

let logsDir: string | null = null
let logFile: string | null = null
let minLevel: LogLevel = app.isPackaged ? 'info' : 'debug'

function ensureLogPaths(): { dir: string; file: string } {
  if (logsDir && logFile) return { dir: logsDir, file: logFile }
  const dir = join(app.getPath('userData'), 'logs')
  mkdirSync(dir, { recursive: true })
  logsDir = dir
  logFile = join(dir, LOG_FILE_NAME)
  return { dir, file: logFile }
}

function rotateIfNeeded(file: string): void {
  let size = 0
  try {
    size = statSync(file).size
  } catch {
    return
  }
  if (size < MAX_FILE_BYTES) return

  // Drop oldest, shift the rest by one slot.
  const oldest = `${file}.${MAX_BACKUPS}`
  if (existsSync(oldest)) {
    try {
      unlinkSync(oldest)
    } catch {
      // best-effort
    }
  }
  for (let i = MAX_BACKUPS - 1; i >= 1; i--) {
    const src = `${file}.${i}`
    const dst = `${file}.${i + 1}`
    if (existsSync(src)) {
      try {
        renameSync(src, dst)
      } catch {
        // best-effort
      }
    }
  }
  try {
    renameSync(file, `${file}.1`)
  } catch {
    // best-effort
  }
}

function serialize(record: LogRecord): string {
  return JSON.stringify(record) + '\n'
}

function consoleMirror(record: LogRecord): void {
  const head = `[${record.ts}] ${record.level.toUpperCase()} ${record.scope} — ${record.msg}`
  const extras: unknown[] = []
  if (record.fields) extras.push(record.fields)
  if (record.err) extras.push(record.err)
  // eslint-disable-next-line no-console
  const sink =
    record.level === 'error'
      ? console.error
      : record.level === 'warn'
        ? console.warn
        : console.log
  sink(head, ...extras)
}

function write(level: LogLevel, scope: string, msg: string, fields?: LogFields, err?: unknown): void {
  if (LEVEL_RANK[level] < LEVEL_RANK[minLevel]) return

  const record: LogRecord = {
    ts: new Date().toISOString(),
    level,
    scope,
    msg,
  }
  if (fields && Object.keys(fields).length > 0) record.fields = fields
  if (err instanceof Error) {
    record.err = { name: err.name, message: err.message, stack: err.stack }
  } else if (err !== undefined) {
    record.err = { name: 'NonError', message: String(err) }
  }

  if (!app.isPackaged) consoleMirror(record)

  try {
    const { file } = ensureLogPaths()
    rotateIfNeeded(file)
    appendFileSync(file, serialize(record), 'utf-8')
  } catch {
    // Logging must never crash the app. Swallow file errors.
  }
}

export interface Logger {
  debug(msg: string, fields?: LogFields): void
  info(msg: string, fields?: LogFields): void
  warn(msg: string, fields?: LogFields, err?: unknown): void
  error(msg: string, fields?: LogFields, err?: unknown): void
  child(subscope: string): Logger
}

function makeLogger(scope: string): Logger {
  return {
    debug(msg, fields) {
      write('debug', scope, msg, fields)
    },
    info(msg, fields) {
      write('info', scope, msg, fields)
    },
    warn(msg, fields, err) {
      write('warn', scope, msg, fields, err)
    },
    error(msg, fields, err) {
      write('error', scope, msg, fields, err)
    },
    child(subscope) {
      return makeLogger(`${scope}.${subscope}`)
    },
  }
}

export function getLogger(scope: string): Logger {
  return makeLogger(scope)
}

export function setMinLogLevel(level: LogLevel): void {
  minLevel = level
}

export function logsDirectory(): string {
  return ensureLogPaths().dir
}
