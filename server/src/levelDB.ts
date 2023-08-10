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

const dbChange = async function (key: string, path: string, value: any): Promise<void> {
  const oriObj = await dbGet(key)
  path.split('.').reduce((p, c, i, a) => {
    if (i === a.length - 1) {
      if (typeof value === 'function') {
        p[c] = value(p[c])
      } else {
        p[c] = value
      }
      return p
    }
    return p[c]
  }, oriObj)
  await db.put(key, oriObj)
}

const dbClear = async function (): Promise<void> {
  await db.clear({
    gte: 'player:',
    lte: 'room:'
  })
}

export { db, dbGet, dbChange, dbClear }
