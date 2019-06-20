import { Directive, Input, ElementRef, Renderer2, OnInit } from '@angular/core'
import { NgStyle } from '@angular/common'
@Directive({
  // tslint:disable-next-line
  selector: '[ha4usCss]',
})
export class CssDirective extends NgStyle {}
