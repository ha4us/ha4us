import { Router } from 'express';

import { UserService } from '@ha4us/adapter';
import { Ha4usError } from '@ha4us/core';
import { WebService } from '../web.service';

module.exports = exports = function(
  route: Router,
  { $users }: { $users: UserService }
) {
  route.use(WebService.bodyParser.json(), WebService.hasRole('user'));

  route
    .get('/_roles', (req, res) => {
      res.status(200).json(UserService.roles);
    })
    .get('/', (req, res) => {
      $users
        .get()
        .then(WebService.sendResponse(res, 200))
        .catch(WebService.sendError(res));
    });

  route
    .route('/:username')
    .get(WebService.onlyOwn(), (req, res) => {
      $users
        .get(req.params.username)
        .then(user => {
          delete user._id;
          WebService.sendResponse(res, 200)(user);
        })
        .catch(WebService.sendError(res));
    })

    .put((req, res) => {
      $users
        .put(req.body)
        .then(WebService.sendResponse(res, 200))
        .catch(WebService.sendError(res));
    })

    .delete((req, res) => {
      $users
        .delete(req.params.username)
        .then(() => {
          res.status(200).end();
        })
        .catch(WebService.sendError(res));
    });
};
