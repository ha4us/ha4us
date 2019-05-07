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
  label: 'CSS Hintergrund',
  type: 'group',
  expandable: false,
  controls: [
    {
      id: 'backgroundColor',
      label: 'Hintergrund',
      type: 'color',
      required: false,
    },
    {
      id: 'backgroundMedia',
      label: 'Hintergrundbild',
      type: 'media[image/(jpeg|png)]',
      required: false,
    },
    {
      id: 'backgroundSize',
      label: 'Größe',
      type: 'select',
      values: 'auto|length|cover|contain|initial|inherit'.split('|'),
      required: false,
    },
    {
      id: 'backgroundRepeat',
      label: 'Wiederholen',
      type: 'select',
      values: 'repeat|repeat-x|repeat-y|no-repeat|initial|inherit'.split('|'),
      required: false,
    },
    {
      id: 'backgroundPosition',
      label: 'Position',
      type: 'string',
      required: false,
    },
  ],
}

export const COMMON_CSS_TEXT: DynamicFormGroup = {
  label: 'CSS Text',
  type: 'group',

  expandable: true,
  controls: [
    {
      id: 'color',
      label: 'Farbe',
      type: 'color',
      required: false,
    },
    {
      id: 'lineHeight',
      label: 'Zeilenhöhe',
      type: 'string',
      required: false,
    },
    {
      id: 'fontFamily',
      label: 'Zeichensatz',
      type: 'string',
      /*values: 'repeat|repeat-x|repeat-y|no-repeat|initial|inherit'.split(
                '|'
            ),*/
      required: false,
    },
    {
      id: 'fontSize',
      label: 'Größe',
      type: 'string',
      /*values: 'repeat|repeat-x|repeat-y|no-repeat|initial|inherit'.split(
                '|'
            ),*/
      required: false,
    },
    {
      id: 'fontStyle',
      label: 'Stil',
      type: 'select',
      values: 'normal|italic'.split('|'),
      required: false,
    },
    {
      id: 'fontWeight',
      label: 'Gewicht',
      type: 'select',
      values: 'normal|bold'.split('|'),
      required: false,
    },
  ],
}

export const COMMON_CONTROLS: WidgetFormDefinition = [
  {
    label: 'Allgemein',
    type: 'group',
    expandable: true,
    controls: [
      {
        id: 'label',
        label: 'Bezeichnung',
        type: 'string',
        required: false,
      },
      {
        id: 'height',
        label: 'Höhe',
        type: 'number',
        required: false,
      },
      {
        id: 'width',
        label: 'Breite',
        type: 'number',
        required: false,
      },
      {
        id: 'visor',
        label: 'Visor',
        type: 'visor',
        required: false,
      },
    ],
  },
  {
    label: 'CSS',
    type: 'group',
    id: 'styles',
    expandable: true,
    controls: [COMMON_BACKGROUND, COMMON_CSS_TEXT],
  },
]
