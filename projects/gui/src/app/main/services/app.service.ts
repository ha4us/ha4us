import { Injectable } from '@angular/core'
import { ReplaySubject } from 'rxjs'
import { take } from 'rxjs/operators'
@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor() {
    this.showMenu$.next(false)
  }

  showMenu$ = new ReplaySubject<boolean>(1)

  showMenu(show: boolean) {
    this.showMenu$.next(show)
  }

  toggleMenu() {
    this.showMenu$.pipe(take(1)).subscribe(val => {
      this.showMenu$.next(!val)
    })
  }

}
