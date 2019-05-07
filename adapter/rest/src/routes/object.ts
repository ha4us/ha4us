import { ObjectService } from 'ha4us/adapter'
import { Ha4usError, Ha4usLogger } from 'ha4us/core'

import { WebService, Router, Request, Response } from '../web.service'
module.exports = exports = function(
  objectRoute: Router,
  { $log, $objects }: { $log: Ha4usLogger; $objects: ObjectService }
) {
  objectRoute.use(WebService.hasRole('user'), WebService.bodyParser.json())

  objectRoute

    .get('/', WebService.hasRole('admin'), (req, res) => {
      $log.debug('Getting object %s', req.params.topic, req.query)
      $objects
        .get(
          JSON.parse(req.query.query),
          parseInt(req.query.page, 10),
          parseInt(req.query.pagesize, 10)
        )
        .then(WebService.sendResponse(res))
        .catch(WebService.sendError(res, $log))
    })
    .get('/:topic(*)', (req, res) => {
      $log.debug('Getting object %s', req.params.topic, req.query)

      $objects
        .getOne(req.params.topic)
        .then(WebService.sendResponse(res))
        .catch(WebService.sendError(res))
    })
    .delete('/:topic(*)', WebService.hasRole('admin'), (req, res) => {
      $log.debug('Deleting object %s', req.params.topic, req.query)
      $objects
        .delete(req.params.topic)
        .then(WebService.sendResponse(res))
        .catch(WebService.sendError(res, $log))
    })
    .put('/:topic(*)', WebService.hasRole('admin'), (req, res) => {
      $objects
        .put(req.body, req.params.topic)
        .then(WebService.sendResponse(res))
        .catch(WebService.sendError(res, $log))
    })
    .post('/', WebService.hasRole('admin'), (req, res) => {
      $objects
        .post(req.body)
        .then(WebService.sendResponse(res, 201))
        .catch(WebService.sendError(res, $log))
    })
}
