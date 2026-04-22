import type { InstanceId } from '@shared/models'

export function partitionForInstance(id: InstanceId): string {
  return `persist:instance-${id}`
}
