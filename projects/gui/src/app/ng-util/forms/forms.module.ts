import {
  NgModule,
  ModuleWithProviders,
  Type,
  InjectionToken,
  Optional,
  SkipSelf,
} from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms'
import { FlexLayoutModule } from '@angular/flex-layout'
import {
  MatButtonModule,
  MatCheckboxModule,
  MatIconModule,
  MatInputModule,
  MatSelectModule,
  MatExpansionModule,
  MatChipsModule,
  MatAutocompleteModule,
} from '@angular/material'

import { ControlComponent } from './components/control/control.component'
import { ArrayComponent } from './components/array/array.component'
import { GroupComponent } from './components/group/group.component'
import { MaterialFormComponent } from './components/material-form/material-form.component'

import { DynamicControlComponent } from './components/dynamic-control/dynamic-control.component'
import { TagInputComponent } from './components/tag-input/tag-input.component'
import { US_FORM_CONTROLS } from './services/form_control.token'
import { FormbuilderService } from './services/formbuilder.service'
import { FormLibraryService } from './services/formlibrary.service'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatChipsModule,
    MatAutocompleteModule,
  ],
  declarations: [
    ControlComponent,
    ArrayComponent,
    GroupComponent,
    MaterialFormComponent,
    DynamicControlComponent,
    TagInputComponent,
  ],
  exports: [
    MaterialFormComponent,
    ControlComponent,
    GroupComponent,
    ArrayComponent,
    TagInputComponent,
  ],
  entryComponents: [TagInputComponent],
})
export class UsFormsModule {
  static forRoot(controls: Type<any>[] = []): ModuleWithProviders {
    return {
      ngModule: UsFormsModule,
      providers: [
        {
          provide: US_FORM_CONTROLS,
          useValue: [TagInputComponent],
          multi: true,
        },
        {
          provide: US_FORM_CONTROLS,
          useValue: controls,
          multi: true,
        },
        FormLibraryService,
      ],
    }
  }

  static forFeature(controls: Type<any>[] = []): ModuleWithProviders {
    return {
      ngModule: UsFormsModule,
      providers: [
        {
          provide: US_FORM_CONTROLS,
          useValue: controls,
          multi: true,
        },
        FormLibraryService,
        FormbuilderService,
      ],
    }
  }
}
