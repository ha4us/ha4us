import { ID } from '@datorama/akita'

import { uuid } from '@ha4us/core'

export interface DashboardCard {
  id: string
  label: string
}

export interface Dashboard {
  id: ID
  label: string
  media: string
  cards: DashboardCard[]
}

/**
 * A factory function that creates Dashboard
 */
export function createDashboard(params: Partial<Dashboard>) {
  return {
    id: uuid(),
    cards: [],
    ...params,
  } as Dashboard
}

export function createCard(params: Partial<DashboardCard>): DashboardCard {
  return {
    id: uuid(),
    label: 'unknown',
    ...params,
  }
}
