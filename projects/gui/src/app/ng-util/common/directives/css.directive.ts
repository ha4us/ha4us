import { Directive, Input, ElementRef, Renderer2, OnInit } from '@angular/core'

@Directive({
    // tslint:disable-next-line
    selector: '[usCss]',
})
export class CssDirective implements OnInit {
    @Input()
    set usCss(css) {
        if (css && this.style && this._css !== css) {
            this._css = css
            const text = this.renderer.createText(css)
            if (this.style.firstChild) {
                this.style.firstChild.remove()
            }
            this.style.appendChild(text)
        }
    }

    _css: string

    style: Element

    constructor(protected element: ElementRef, protected renderer: Renderer2) {
        this.style = this.renderer.createElement('style')
        this.style.setAttribute('type', 'text/css')
    }

    ngOnInit() {
        this.renderer.appendChild(this.element.nativeElement, this.style)
    }
}
