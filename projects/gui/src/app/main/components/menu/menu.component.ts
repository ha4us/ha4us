import { Component, OnInit } from '@angular/core'
import { AppService } from '../../services/app.service'
@Component({
  selector: 'ha4us-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent implements OnInit {
  constructor(protected as: AppService) {}

  ngOnInit() {}

  showMenu(show: boolean) {
    this.as.showMenu(show)
  }
}
