import {
    Directive,
    Input,
    ElementRef,
    OnInit,
    Renderer2,
    KeyValueDiffer,
    KeyValueDiffers,
    KeyValueChanges,
    DoCheck,
} from '@angular/core'
import { NgStyle } from '@angular/common'
import { VisorEntity } from '../../models'

import { MediaService } from '@ha4us/ng'
@Directive({
    selector: '[ha4usStyle]',
})
export class StyleDirective implements DoCheck {
    private _ngStyle!: { [key: string]: string }
    // TODO(issue/24571): remove '!'.
    private _differ: KeyValueDiffer<string, string | number>

    constructor(
        private _differs: KeyValueDiffers,
        private _ngEl: ElementRef,
        private _renderer: Renderer2
    ) { }

    @Input()
    set ha4usStyle(values: VisorEntity) {
        if (values && values.styles) {
            this._ngStyle = values.styles

            if (
                this._ngStyle.hasOwnProperty('backgroundMedia') &&
                this._ngStyle.backgroundMedia
            ) {
                this._ngStyle.backgroundImage = MediaService.getCSSURL(
                    this._ngStyle.backgroundMedia
                )
            }
            if (!this._differ && values.styles) {
                this._differ = this._differs.find(values.styles).create()
            }
        }
    }

    ngDoCheck() {
        if (this._differ) {
            const changes = this._differ.diff(this._ngStyle)
            if (changes) {
                this._applyChanges(changes)
            }
        }
    }

    private _applyChanges(
        changes: KeyValueChanges<string, string | number>
    ): void {
        changes.forEachRemovedItem(record => this._setStyle(record.key, null))
        changes.forEachAddedItem(record =>
            this._setStyle(record.key, record.currentValue)
        )
        changes.forEachChangedItem(record =>
            this._setStyle(record.key, record.currentValue)
        )
    }

    private _setStyle(
        nameAndUnit: string,
        value: string | number | null | undefined
    ): void {
        const [name, unit] = nameAndUnit.split('.')
        value = value != null && unit ? `${value}${unit}` : value

        if (value != null) {
            this._renderer.setStyle(
                this._ngEl.nativeElement,
                name,
                value as string
            )
        } else {
            this._renderer.removeStyle(this._ngEl.nativeElement, name)
        }
    }
}
