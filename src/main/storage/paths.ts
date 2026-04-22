import { app } from 'electron'
import { join } from 'path'

export const instancesJsonPath = join(app.getPath('userData'), 'instances.json')
