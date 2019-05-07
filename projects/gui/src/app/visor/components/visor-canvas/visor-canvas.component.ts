import { Component, OnInit } from '@angular/core'
import { VisorService } from '../../services/visor.service'

const debug = require('debug')('ha4us:gui:visor:canvas')

@Component({
  selector: 'ha4us-visor-canvas',
  templateUrl: './visor-canvas.component.html',
  styleUrls: ['./visor-canvas.component.scss'],
})
export class VisorCanvasComponent implements OnInit {
  constructor(protected vs: VisorService) {}

  visor = this.vs.mainContainer$

  ngOnInit() {}
}
