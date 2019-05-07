import { Pipe, PipeTransform, OnDestroy } from '@angular/core'

import { Subscription } from 'rxjs'
import { map, shareReplay } from 'rxjs/operators'

import { Ha4usRoleDefinition } from '../models'
import { SettingsService } from '../services/settings.service'
import { convertWildcarded, Ha4usObject, Ha4usObjectDisplay } from 'ha4us/core'
import merge from 'lodash/merge'
const DEF_ROLE: Ha4usRoleDefinition = {
  selector: '*',
  label: 'Not found',
  // icon: 'role:plug',
}

@Pipe({
  name: 'ha4usRole',
  pure: true,
})
export class Ha4usRolePipe implements PipeTransform, OnDestroy {
  protected roles: object

  protected sub: Subscription
  protected lastValueIn: string | Ha4usObject
  protected curValue: Ha4usObjectDisplay

  protected indexedRoles = this.settings
    .observe<Ha4usRoleDefinition[]>('user.roles')
    .pipe(
      map(
        (roles: Ha4usRoleDefinition[]) =>
          roles.map(role => ({
            role,
            selector: convertWildcarded(role.selector),
          })),
        shareReplay({ refCount: true, bufferSize: 1 })
      )
    )

  constructor(protected settings: SettingsService) {
    this.curValue = DEF_ROLE
  }

  transform(roleId: string | Ha4usObject): Ha4usObjectDisplay {
    if (roleId !== this.lastValueIn) {
      this.curValue = DEF_ROLE
      this.lastValueIn = roleId
      this.ngOnDestroy()
      this.sub = this.indexedRoles.subscribe(roles => {
        const roleMode = typeof roleId === 'string'
        const id = typeof roleId === 'string' ? roleId : roleId.role
        const foundRole = roles.find(role => role.selector.test(id))

        if (roleMode) {
          this.curValue = foundRole ? foundRole.role : DEF_ROLE
        } else {
          this.curValue = foundRole
            ? merge({}, roleId, foundRole.role)
            : (roleId as Ha4usObjectDisplay)
        }
      })
    }

    return this.curValue
  }

  ngOnDestroy() {
    if (this.sub) {
      this.sub.unsubscribe()
    }
    this.curValue = DEF_ROLE
  }
}
