import type { InstanceId } from './models'

export function partitionForInstance(id: InstanceId): string {
  return `persist:instance-${id}`
}
