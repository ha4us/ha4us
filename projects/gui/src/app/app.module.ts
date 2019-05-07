import { BrowserModule } from '@angular/platform-browser'
import { HttpClientModule } from '@angular/common/http'
import { NgModule, LOCALE_ID } from '@angular/core'

import { registerLocaleData } from '@angular/common'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import localeDede from '@angular/common/locales/de.js'
import localeDedeExtra from '@angular/common/locales/extra/de'

import { AppComponent } from './app.component'
import { AppRoutingModule } from './app-routing.module'

import { MainModule } from './main/main.module'
import { Ha4usModule } from '@ha4us/ng'
import { StoreModule, ActionReducerMap, ActionReducer } from '@ngrx/store'
import { StoreDevtoolsModule } from '@ngrx/store-devtools'
import { EffectsModule } from '@ngrx/effects'

import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store'

import 'moment/locale/de'
import { WidgetsModule } from './widgets'

registerLocaleData(localeDede, localeDedeExtra)
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    StoreModule.forRoot({ router: routerReducer }),
    EffectsModule.forRoot([]),
    StoreDevtoolsModule.instrument({
      name: 'Ha4us Store DevTools',
    }),
    WidgetsModule,
    MainModule,
    Ha4usModule,
    AppRoutingModule,
    StoreRouterConnectingModule.forRoot(),
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'de-DE' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
