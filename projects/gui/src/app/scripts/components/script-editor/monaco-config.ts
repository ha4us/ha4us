import { Injectable } from '@angular/core'

import { map, take, tap } from 'rxjs/operators'
import { NgxMonacoEditorConfig } from 'ngx-monaco-editor'
import { ScriptService } from '../../services/script.service'

import Editor = monaco.editor

@Injectable()
export class MonacoConfig implements NgxMonacoEditorConfig {
  constructor(protected scripts: ScriptService) {}

  defaultOptions: Editor.IEditorOptions = {
    fontSize: 16,
    minimap: { enabled: false },
  }
  onMonacoLoad() {
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    })

    // compiler options
    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      target: monaco.languages.typescript.ScriptTarget.ES2018,
      allowNonTsExtensions: true,
      checkJs: true,
      typeRoots: ['node_modules/@types'],
    })
    this.scripts.loadHelper('luxon.d.ts').subscribe(data => {
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        data,
        'node_modules/@types/luxon.d.ts'
      )
    })
    this.scripts.loadHelper('rxjs.d.ts').subscribe(data => {
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        data,
        'rxjs.d.ts'
      )
    })

    this.scripts.loadHelper('./ha4us.d.ts').subscribe(data => {
      monaco.languages.typescript.javascriptDefaults.addExtraLib(
        data,
        'global'
      )
    })

    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (
        model,
        position,
        context,
        token
      ): monaco.languages.ProviderResult<monaco.languages.CompletionList> => {
        const lastChar = model.getWordAtPosition(position)

        //  if (context.triggerCharacter === '$') {
        return this.scripts.topics$
          .pipe(
            map((tree: string[]) =>
              tree.map(node => {
                return {
                  label: node,
                  kind: monaco.languages.CompletionItemKind.Value,
                  // documentation: '',
                  insertText: `'${node}'`,
                  detail: 'ha4us-topic',
                }
              })
            ),

            take(1)
          )
          .toPromise()
          .then(suggestions => ({
            suggestions,
          })) as monaco.languages.ProviderResult<
          monaco.languages.CompletionList
        >
        // }
      },
    })
  }
}
