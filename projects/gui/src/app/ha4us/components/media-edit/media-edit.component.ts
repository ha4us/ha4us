import {
  Component,
  OnInit,
  OnDestroy,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from '@angular/core'

import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  Validators,
} from '@angular/forms'

import { Subscription } from 'rxjs'

import { debounceTime, filter } from 'rxjs/operators'

import { Ha4usMedia } from 'ha4us/core'

import { MediaService } from '../../services/media.service'

@Component({
  selector: 'ha4us-media-edit',
  templateUrl: './media-edit.component.html',
  styleUrls: ['./media-edit.component.scss'],
})
export class MediaEditComponent implements OnInit, OnDestroy {
  @Input()
  set media(media: Ha4usMedia) {
    this.setMedia(media)
  }

  @Output() public mediaChange: EventEmitter<Ha4usMedia> = new EventEmitter()

  protected ignoreChanges = false

  protected _sub: Subscription

  public editForm: FormGroup

  allTags = this.ms.allTags$

  constructor(protected fb: FormBuilder, protected ms: MediaService) {
    this.editForm = fb.group({
      id: [{ value: '', disabled: true }],
      urn: [{ value: '', disabled: true }],
      filename: ['', Validators.required],
      tags: [[]],
      contentType: [{ value: '', disabled: true }],
      length: [{ value: '', disabled: true }],
      md5: [{ value: '', disabled: true }],
      expires: [{ value: '', disabled: true }],
      uploadDate: [{ value: '', disabled: true }],
      owner: [{ value: '', disabled: true }],
      description: [],
    })
  }

  ngOnInit() {
    this._sub = this.editForm.valueChanges
      .pipe(filter(media => this.editForm.valid))
      .subscribe(newMedia => {
        if (!this.ignoreChanges) {
          this.mediaChange.emit(this.editForm.getRawValue())
        }
        this.ignoreChanges = false
      })
  }

  public setMedia(media: Ha4usMedia) {
    if (media) {
      this.editForm.patchValue(media, { emitEvent: false })
      this.ignoreChanges = true
    }
  }

  ngOnDestroy() {
    this._sub.unsubscribe()
  }
}
