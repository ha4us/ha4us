import { Injectable } from '@angular/core'

import { map, take, tap } from 'rxjs/operators'
import { NgxMonacoEditorConfig } from 'ngx-monaco-editor'
import { ScriptService } from '../../services/script.service'

import Editor = monaco.editor

function createHa4usSnippets(): monaco.languages.CompletionItem[] {
    // returning a static list of proposals, not even looking at the prefix (filtering is done by the Monaco editor),
    // here you could do a server side lookup
    return [
        {
            label: 'observe',
            filterText: 'observe',
            documentation: `public observe(topic: string, ...params: any[]) {
    return this._services.$states.observe(topic, ...params)
  }`,
            kind: monaco.languages.CompletionItemKind.Method,
            insertText: {
                value: ['observe (${1:topic}).pipe().subscribe(', ')'].join(
                    '\n'
                ),
            },
            detail: 'ha4us',
        },
    ]
}

@Injectable()
export class MonacoConfig implements NgxMonacoEditorConfig {
    constructor(protected scripts: ScriptService) {}

    defaultOptions: Editor.IEditorOptions = {
        fontSize: 16,
        minimap: { enabled: false },
    }
    onMonacoLoad() {
        monaco.languages.registerCompletionItemProvider('javascript', {
            triggerCharacters: ['$'],
            provideCompletionItems: (
                model,
                position,
                token,
                context
            ):
                | Promise<monaco.languages.CompletionItem[]>
                | monaco.languages.CompletionItem[] => {
                if (context.triggerCharacter === '$') {
                    return this.scripts.topics$
                        .pipe(
                            map((tree: string[]) =>
                                tree.map(node => {
                                    return {
                                        label: node,
                                        filterText: '$' + node,
                                        kind:
                                            monaco.languages.CompletionItemKind
                                                .Text,
                                        // documentation: 'The Lodash library exported as Node.js modules.',
                                        insertText: `'${node}'`,
                                        detail: 'ha4us',
                                    }
                                })
                            ),

                            take(1)
                        )
                        .toPromise()
                } else {
                    return createHa4usSnippets()
                }
            },
        })
    }
}
