import { Component, OnInit, Renderer2, ElementRef } from '@angular/core'
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http'

@Component({
  selector: 'ha4us-telegram-login',
  templateUrl: './telegram-login.component.html',
  styleUrls: ['./telegram-login.component.scss'],
})
export class TelegramLoginComponent implements OnInit {
  fetchedHtml: any

  constructor(protected http: HttpClient) {}

  ngOnInit() {
    /*  (window as any).TelegramLoginWidget = {
      dataOnauth: user => {
        console.log('LOG', user)
      },
    }

    https://oauth.telegram.org/embed/ha4usdev?origin=http%3A%2F%2Flocalhost%3A4200&size=medium&userpic=true&request_access=write&radius=10
    const botName = 'ha4usdev'
    const buttonSize = 'medium'
    const cornerRadius = 10
    const requestAccess = 'write'
    const usePic = true
    const script = this.renderer.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?4'
    script.setAttribute('data-telegram-login', botName)
    script.setAttribute('data-size', buttonSize)
    if (cornerRadius !== undefined) {
      script.setAttribute('data-radius', cornerRadius)
    }
    script.setAttribute('data-request-access', requestAccess)
    script.setAttribute('data-userpic', usePic)
    script.setAttribute('data-onauth', 'TelegramLoginWidget.dataOnauth(user)')
    script.async = true
    this.renderer.appendChild(this.element.nativeElement, script)*/
    const headers = new HttpHeaders()

    let params = new HttpParams()
    params = params.append('origin', 'ha4us.steinberg-online.de')
    params = params.append('size', 'medium')
    params = params.append('userpic', 'true')
    params = params.append('request-access', 'write')
    params = params.append('radius', '10')
    console.log(params.toString())

    headers.append('x-forwarded-host', 'http://ha4us.steinberg-online.de:4200')
    const url = 'https://oauth.telegram.org/embed/ha4usdevBot'
    this.http.get(url, { headers, params }).subscribe(response => {
      console.log(response)
      this.fetchedHtml = response
    })
  }
}
