import { Level } from 'level'
import path from 'path'

const db = new Level<string, any>(path.resolve(__dirname, '../db'), { valueEncoding: 'json' })

const dbGet = async function (key: string): Promise<any> {
  try {
    return await db.get(key)
  } catch (e) {
    if (e.notFound === true) {
      return undefined
    } else {
      throw e
    }
  }
}

const dbClear = async function (): Promise<void> {
  await db.clear({
    lte: 'z:static:'
  })
}

export { db, dbGet, dbClear }
