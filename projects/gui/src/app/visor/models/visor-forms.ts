import {
  DynamicFormControl,
  DynamicForm,
  DynamicFormGroup,
} from '@ulfalfa/ng-util'
import { VisorEntityType } from './container.model'
export interface LabeledDynamicFormControl {
  label: string
  group?: string
  typeOnly?: VisorEntityType
  controls: DynamicFormControl[]
}
export type WidgetFormDefinition = DynamicFormGroup[]

export const COMMON_BACKGROUND: DynamicFormGroup = {
  placeholder: 'CSS Hintergrund',
  type: 'group',
  expandable: false,
  controls: [
    {
      id: 'backgroundColor',
      placeholder: 'Hintergrund',
      type: 'color',
      required: false,
    },
    {
      id: 'backgroundMedia',
      placeholder: 'Hintergrundbild',
      type: 'media[image/(jpeg|png)]',
      required: false,
    },
    {
      id: 'backgroundSize',
      placeholder: 'Größe',
      type: 'select',
      values: 'auto|length|cover|contain|initial|inherit'.split('|'),
      required: false,
    },
    {
      id: 'backgroundRepeat',
      placeholder: 'Wiederholen',
      type: 'select',
      values: 'repeat|repeat-x|repeat-y|no-repeat|initial|inherit'.split('|'),
      required: false,
    },
    {
      id: 'backgroundPosition',
      placeholder: 'Position',
      type: 'string',
      required: false,
    },
  ],
}

export const COMMON_CSS_TEXT: DynamicFormGroup = {
  placeholder: 'CSS Text',
  type: 'group',

  expandable: true,
  controls: [
    {
      id: 'color',
      placeholder: 'Farbe',
      type: 'color',
      required: false,
    },
    {
      id: 'lineHeight',
      placeholder: 'Zeilenhöhe',
      type: 'string',
      required: false,
    },
    {
      id: 'fontFamily',
      placeholder: 'Zeichensatz',
      type: 'string',
      /*values: 'repeat|repeat-x|repeat-y|no-repeat|initial|inherit'.split(
                '|'
            ),*/
      required: false,
    },
    {
      id: 'fontSize',
      placeholder: 'Größe',
      type: 'string',
      /*values: 'repeat|repeat-x|repeat-y|no-repeat|initial|inherit'.split(
                '|'
            ),*/
      required: false,
    },
    {
      id: 'fontStyle',
      placeholder: 'Stil',
      type: 'select',
      values: 'normal|italic'.split('|'),
      required: false,
    },
    {
      id: 'fontWeight',
      placeholder: 'Gewicht',
      type: 'select',
      values: 'normal|bold'.split('|'),
      required: false,
    },
  ],
}

export const COMMON_CONTROLS: WidgetFormDefinition = [
  {
    placeholder: 'Allgemein',
    type: 'group',
    expandable: true,
    controls: [
      {
        id: 'label',
        placeholder: 'Bezeichnung',
        type: 'string',
        required: false,
      },
      {
        id: 'height',
        placeholder: 'Höhe',
        type: 'number',
        required: false,
      },
      {
        id: 'width',
        placeholder: 'Breite',
        type: 'number',
        required: false,
      },
      {
        id: 'visor',
        placeholder: 'Visor',
        type: 'visor',
        required: false,
      },
    ],
  },
  {
    placeholder: 'CSS',
    type: 'group',
    id: 'styles',
    expandable: true,
    controls: [COMMON_BACKGROUND, COMMON_CSS_TEXT],
  },
]
