import { UserService, Ha4usToken } from '@ha4us/adapter';
import { Ha4usLogger, Ha4usError } from '@ha4us/core';
import { WebService, Request, Response, Router } from '../web.service';

module.exports = exports = function handler(
  route: Router,
  { $log, $users }: { $log: Ha4usLogger; $users: UserService }
) {
  async function checkUser(
    userName: string,
    password: string,
    res: Response
  ): Promise<void> {
    return $users
      .verify(userName, password)
      .then(user => {
        $log.debug('Logging in', user.username);
        const token = $users.createToken(user);
        WebService.setTokenCookie(res, token);
        res.status(200).json(token);
      })
      .catch(e => {
        $log.debug('Error 401', e);
        res.status(401).send(e);
      });
  }

  route.post('/login', WebService.bodyParser.json(), async (req, res) => {
    let userName, password;
    if (!(req.body.username && req.body.password)) {
      res.status(400).send('please supply username and password in query');
      return;
    }
    userName = req.body.username;
    password = req.body.password || '';
    $log.debug('Tryiing to log in', userName);
    await checkUser(userName, password, res);
  });
  route.get('/login', async (req, res) => {
    $log.debug('Try to login with basic auth');
    const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
    const [userName, password] = new Buffer(b64auth, 'base64')
      .toString()
      .split(':');
    if (!(userName && password)) {
      res.status(400).send('please supply username and password in url');
      return;
    }
    await checkUser(userName, password, res);
  });

  route.post('/logout', (req, res) => {
    res.clearCookie('token', { httpOnly: true });
    res.status(200).end();
  });

  route.get('/refresh', WebService.hasRole(), async (req: Request, res) => {
    await checkUser(req.token, undefined, res);
  });
};
