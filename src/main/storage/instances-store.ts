import { readFileSync, writeFileSync, mkdirSync, renameSync } from 'fs'
import { dirname, join } from 'path'
import { EventEmitter } from 'events'
import type { Instance, InstanceId } from '@shared/models'
import { instancesJsonPath } from './paths'

class InstancesStore extends EventEmitter {
  private cache: Instance[] | null = null

  list(): Instance[] {
    if (this.cache) return this.cache
    try {
      const raw = readFileSync(instancesJsonPath, 'utf-8')
      this.cache = JSON.parse(raw) as Instance[]
    } catch {
      this.cache = []
    }
    return this.cache
  }

  upsert(instance: Instance): Instance {
    const instances = this.list()
    const idx = instances.findIndex((i) => i.id === instance.id)
    if (idx >= 0) {
      instances[idx] = instance
    } else {
      instances.push(instance)
    }
    this.persist(instances)
    return instance
  }

  delete(id: InstanceId): void {
    const instances = this.list().filter((i) => i.id !== id)
    this.persist(instances)
  }

  private persist(instances: Instance[]): void {
    const dir = dirname(instancesJsonPath)
    mkdirSync(dir, { recursive: true })
    const tmp = join(dir, `instances.${Date.now()}.tmp`)
    writeFileSync(tmp, JSON.stringify(instances, null, 2), 'utf-8')
    renameSync(tmp, instancesJsonPath)
    this.cache = instances
    this.emit('changed', instances)
  }
}

export const instancesStore = new InstancesStore()
