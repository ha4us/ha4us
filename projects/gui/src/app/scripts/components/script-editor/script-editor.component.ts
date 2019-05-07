import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { FormGroup, FormControl, FormBuilder } from '@angular/forms';

import { Subscription, Observable } from 'rxjs';
import { map, tap, mergeMap, filter, take } from 'rxjs/operators';

import { MqttUtil } from '@ha4us/core';
import { ScriptService } from '../../services/script.service';

import { MonacoConfig } from './monaco-config';
import { NGX_MONACO_EDITOR_CONFIG } from 'ngx-monaco-editor';

import { CanComponentDeactivate } from '@ha4us/ng';

import { MessageService, Msg } from '@app/main';

const debug = require('debug')('ha4us:gui:scripts:editor');

@Component({
  selector: 'ha4us-script-editor',
  templateUrl: './script-editor.component.html',
  styleUrls: ['./script-editor.component.scss'],
  providers: [{ provide: NGX_MONACO_EDITOR_CONFIG, useClass: MonacoConfig }],
})
export class ScriptEditorComponent
  implements OnInit, OnDestroy, CanComponentDeactivate {
  currentTopic$ = this.route.paramMap.pipe(
    tap(params => debug('current route topic', params.get('topic'))),
    map(params => params.get('topic'))
  );

  script$ = this.currentTopic$.pipe(mergeMap(topic => this.scripts.get(topic)));

  editor: monaco.editor.ICodeEditor;

  editorOptions = {
    theme: 'vs-code',
    language: 'javascript',
  };

  form = this.fb.group({
    name: this.fb.control(''),
    source: this.fb.control(''),
    autostart: this.fb.control([false]),
  });

  sub: Subscription;

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any) {
    if (this.form.dirty) {
      $event.returnValue = '';
    }
  }

  constructor(
    protected scripts: ScriptService,
    protected router: Router,
    protected route: ActivatedRoute,
    protected fb: FormBuilder,
    protected ms: MessageService
  ) {}

  ngOnInit() {
    this.sub = this.script$.pipe(take(1)).subscribe(script => {
      debug('Setting updated form values');
      this.form.reset(script, { emitEvent: false, onlySelf: false });
      debug('Is Dirty', this.form.dirty);
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  goToList() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  save($event?: MouseEvent) {
    debug('Saving', this.form.value);
    this.scripts.save(this.form.value);
    this.form.markAsPristine();
    debug('Form after save is dirty', this.form.dirty);
  }

  setEditor(editor) {
    this.editor = editor;
    // tslint:disable-next-line
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
      this.save();
    });
  }

  selectError(error: string) {
    const name = this.form.value.name;
    const matcher = new RegExp(name + ':(\\d*)(?::(\\d*))?', 'm');

    const [_, lineString, colString] = error.match(matcher);

    if (this.editor) {
      const lineNumber = lineString ? parseInt(lineString, 10) : 1;
      const column = colString ? parseInt(colString, 10) : 1;
      this.editor.focus();
      this.editor.revealLineInCenter(lineNumber);
    }
  }

  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    console.log('canDeactivate has fired in the component!', this.form.dirty);
    if (this.form.dirty) {
      return this.ms.confirm(Msg.CancelEdit);
    } else {
      return true;
    }
  }
}
