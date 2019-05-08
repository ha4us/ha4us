export class Matcher {
  private _regexp: RegExp
  private _topic: string
  private _pattern: string

  constructor(aTopicPattern = '') {
    aTopicPattern = aTopicPattern || ''
    const escaped = aTopicPattern.replace(/[-[\]{}()*?.,^$|\s]/g, '\\$&')
    this._regexp = new RegExp(
      '^' + escaped.replace(/\+/g, '([^/]*)').replace(/#/g, '(.*?)') + '$'
    )
    this._pattern = aTopicPattern

    const hashPos = aTopicPattern.indexOf('#')
    if (hashPos > -1) {
      this._topic = aTopicPattern.substring(0, hashPos + 1)
    } else {
      this._topic = aTopicPattern
    }
  }

  get regexp(): RegExp {
    return this._regexp
  }

  get topic(): string {
    return this._topic
  }
  get pattern(): string {
    return this._pattern
  }

  test(aTopicToTest: string): boolean {
    return this.regexp.test(aTopicToTest)
  }

  match(aTopicToTest: string): string[] | null {
    const matches: RegExpExecArray | null = this.regexp.exec(aTopicToTest)
    if (matches) {
      const params: string[] = []
      for (let i = 1; i < matches.length; i++) {
        params.push(matches[i])
      }

      return params
    } else {
      return null
    }
  }
}
