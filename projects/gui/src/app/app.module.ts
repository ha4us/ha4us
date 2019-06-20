import { registerLocaleData } from '@angular/common'
import { HttpClientModule } from '@angular/common/http'
import localeDede from '@angular/common/locales/de.js'
import localeDedeExtra from '@angular/common/locales/extra/de'
import { LOCALE_ID, NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { AkitaNgRouterStoreModule } from '@datorama/akita-ng-router-store'
import { AkitaNgDevtools } from '@datorama/akita-ngdevtools'
import { Ha4usModule } from '@ha4us/ng'
import { UsFormsModule } from '@ulfalfa/ng-util'
import 'moment/locale/de'
import { environment } from '../environments/environment' // Angular CLI environemnt
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { MainModule } from './main/main.module'

registerLocaleData(localeDede, localeDedeExtra)
@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    UsFormsModule.forRoot(),
    AppRoutingModule,
    MainModule,
    Ha4usModule,
    environment.production
      ? AkitaNgRouterStoreModule.forRoot()
      : [AkitaNgDevtools.forRoot(), AkitaNgRouterStoreModule.forRoot()],
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'de-DE' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
