import { DBMediaService, fileToHa4usMedia, MediaService } from '@ha4us/adapter'
import { Ha4usError, Ha4usLogger, Ha4usMedia } from '@ha4us/core'
import axios from 'axios'
import { Db } from 'mongodb'
import * as multer from 'multer'
import * as hash from 'object-hash'
import { MediaStorageEngine } from '../mediastorage.class'
import { Request, Response, Router, WebService } from '../web.service'

// tslint:disable-next-line
module.exports = exports = function(
  route: Router,
  {
    $args,
    $log,
    $media,
    $db,
  }: {
    $args: { voicerssApikey: string };
    $log: Ha4usLogger;
    $media: MediaService
    $db: Db;
  }
) {
  function sendStreamMedia(res: Response) {
    return (item: Ha4usMedia) => {
      $log.debug('Sending item', item)
      res.set('Content-Type', item.contentType)
      res.set('Content-Length', String(item.length))
      $log.debug('Headers', res.getHeaders())

      const readstream = $media.getReadStream(item)
      readstream.pipe(res)

      res.on('error', err => {
        $log.error('Got error while processing stream ' + err.message)
        res.status(500)
        res.end()
      })
      readstream.on('error', err => {
        $log.error('Got error while processing stream ' + err.message)
        res.status(500)
        res.end()
      })
    }
  }

  const storage = new MediaStorageEngine($log, $media)
  const upload = multer({ storage })

  route.use(WebService.hasRole('user', 'api'), WebService.bodyParser.json())

  route.post(
    '/',

    upload.single('file'),
    (req, res, next) => {
      $log.debug('Uploaded', req.file)
      res.status(200).json(fileToHa4usMedia(req.file))
    }
  )

  route.get('/tts.mp3', async (req, res) => {
    $log.debug('Create TTS %s with token', req.query.say, req.query.token)

    if (typeof $args.voicerssApikey === 'undefined') {
      throw new Ha4usError(500, 'please specify apikey for tts')
    }

    const ttsParms = {
      text: decodeURIComponent(req.query.say),
      lang: 'de-de',
      quality: '16khz_8bit_mono',
    }

    const filename = 'tts' + hash(ttsParms) + '.mp3'
    $log.debug('Looking in cache for %s', filename)

    return $media
      .getByFilename(filename)
      .catch(async (e: Ha4usError) => {
        if (e.name === 'Ha4usError' && e.code === 404) {
          $log.debug('Getting tts from VoiceRss', ttsParms)
          const uri = encodeURI(
            'https://api.voicerss.org?key=' +
              $args.voicerssApikey +
              '&src=' +
              ttsParms.text +
              '&c=MP3' +
              '&f=' +
              ttsParms.quality +
              '&hl=' +
              ttsParms.lang
          )

          return axios.get(uri, { responseType: 'stream' }).then(response => {
            // media.contentType = response.headers['content-type']

            $log.debug(
              'Response header from voicrss %s',
              response.status,
              response.headers
            )
            const writestream = $media.getWriteStream(filename, {
              contentType: response.headers['content-type'],
              native: ttsParms,
              description: '',
              dtl: 30,
              owner: 'tts',
            })

            return new Promise<Ha4usMedia>((resolve, reject) => {
              response.data.pipe(writestream)
              writestream.once('finish', file => {
                $log.debug('gridfs-storage-engine: saved', file.filename)
                resolve(fileToHa4usMedia(file))
              })
            })
          })
        } else {
          $log.error(e)
          throw e
        }
      })
      .then(data => {
        $log.debug('No reading ', data)
        return data
      })
      .then(sendStreamMedia(res))
      .catch(WebService.sendError(res, $log))
  })

  route.get('/:id', (req: Request, res: Response) => {
    return (
      $media
        .getById(req.params.id)
        .then(data => {
          return data
        })
        // .catch(WebService.sendError(res, $log))
        .then(sendStreamMedia(res))
        .catch(WebService.sendError(res, $log))
    )
  })
  route.get('/:id/details', (req: Request, res: Response) => {
    return $media
      .getById(req.params.id)
      .then(WebService.sendResponse(res))
      .catch(WebService.sendError(res, $log))
  })

  route.get('/', async (req: Request, res: Response) => {
    $log.debug('Get', req.query.page, req.query.mimePattern)
    return $media
      .get(
        req.query.mimePattern,
        req.query.tags && req.query.tags !== ''
          ? req.query.tags.split(',')
          : [],
        parseInt(req.query.page, 10),
        parseInt(req.query.pagesize, 10)
      )
      .then(WebService.sendResponse(res))
      .catch(WebService.sendError(res, $log))
  })

  route.put('/', async (req: Request, res: Response) => {
    $log.debug('Put', req.body)
    return $media
      .put(req.body)
      .then(WebService.sendResponse(res))
      .catch(WebService.sendError(res, $log))
  })

  route.delete('/:id', async (req: Request, res: Response) => {
    return $media
      .delete(req.params.id)
      .then(WebService.sendResponse(res))
      .catch(WebService.sendError(res, $log))
  })
  route.delete('/', async (req: Request, res: Response) => {
    return $media
      .delete(
        req.query.mimePattern,
        req.query.tags && req.query.tags !== '' ? req.query.tags.split(',') : []
      )
      .then(WebService.sendResponse(res))
      .catch(WebService.sendError(res, $log))
  })
}
