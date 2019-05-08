import { Router } from 'express'
import * as path from 'path'
import * as fs from 'fs'
import { UserService, ObjectService } from '@ha4us/adapter'
import { Ha4usError } from '@ha4us/core'

import { Observable, bindNodeCallback, of, from } from 'rxjs'
import { mergeMap, map } from 'rxjs/operators'

import { WebService } from '../web.service'
// tslint:disable-next-line
module.exports = exports = function(route: Router, { $args, $log }) {
  const statFile = bindNodeCallback(fs.stat)
  const readdir = bindNodeCallback(fs.readdir)
  const readfile = bindNodeCallback(fs.readFile)

  route.get('/:path(*)', (req, res) => {
    const fileName = path.resolve($args.restPublic, req.params.path)
    statFile(fileName)
      .pipe(
        mergeMap(
          (stat: fs.Stats): any => {
            if (stat.isDirectory()) {
              return readdir(fileName).pipe(
                map(filelist =>
                  filelist
                    .map(file => {
                      return {
                        link: req.baseUrl + req.path + '/' + file,
                        type: path.extname(file).substring(1),
                        name: file.replace(/\.[^/.]+$/, ''),
                      }
                    })
                    .filter(
                      entry => !req.query.type || req.query.type === entry.type
                    )
                )
              )
            }
            return of(fileName)
          }
        )
      )
      .subscribe(
        (result: any) => {
          if (typeof result === 'string') {
            res.sendFile(result)
          } else {
            res.json(result)
          }
        },
        e => {
          if (e.code === 'ENOENT') {
            res.status(404).end()
          } else {
            $log.error(e.code)
            res.status(500).end()
          }
        }
      )
  })
}
