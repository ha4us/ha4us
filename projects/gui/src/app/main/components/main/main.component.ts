import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService, AuthInfo } from '@ha4us/ng'
import { AppService } from '../../services/app.service'
@Component({
  selector: 'ha4us-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  showMenu$ = this.as.showMenu$
  constructor(
    protected auth: AuthService,
    protected router: Router,
    public as: AppService
  ) {}

  ngOnInit() {
    this.auth.authInfo$.subscribe(
      data => {
        if (!data) {
          this.router.navigateByUrl('/login')
        }
      },
      err => {
        console.error('Error', err)
      },
      () => {}
    )
  }
  toggleMenu() {
    this.as.toggleMenu()
  }
  showMenu(show: boolean) {
    this.as.showMenu(show)
  }
}
