import { ObjectService } from 'ha4us/adapter'
import {
  Ha4usError,
  Ha4usLogger,
  Ha4usConfig,
  Ha4usConfigObject,
} from 'ha4us/core'

import { WebService, Router, Request, Response } from '../web.service'
module.exports = exports = function (
  route: Router,
  { $log, $objects }: { $log: Ha4usLogger; $objects: ObjectService }
) {
  route.use(WebService.hasRole('user'), WebService.bodyParser.json())

  route.get('/', (req: Request, res: Response) => {
    console.log('Getting for', req.user.username)
    const topic = Ha4usConfigObject.getTopic('#', req.user.username)
    $objects
      .get(topic)
      .then((data: Ha4usConfigObject[]) => {
        return data.map(obj => obj.native.config)
      })
      .then(WebService.sendResponse(res))
      .catch(WebService.sendError(res, $log))
  })

  route.put('/:topic(*)', (req: Request, res: Response) => {
    console.log(req.body, req.user)
    const ha4usObject = new Ha4usConfigObject(req.body, req.user.username)
    $objects
      .put(ha4usObject)
      .catch((e: Ha4usError) => {
        if (e.code === 404) {
          return $objects.post(ha4usObject)
        } else {
          throw e
        }
      })
      .then(WebService.sendResponse(res))
      .catch(WebService.sendError(res, $log))
  })

  route.delete('/:topic(*)', (req: Request, res: Response) => {
    const topic = Ha4usConfigObject.getTopic(
      req.params.topic,
      req.user.username
    )
    $objects
      .delete(topic)
      .then(WebService.sendResponse(res))
      .catch(WebService.sendError(res, $log))
  })
}
