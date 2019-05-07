import { StorageEngine } from 'multer'
import { Request, Express } from 'express'

import { DBMediaService } from 'ha4us/adapter'
import { Ha4usLogger } from 'ha4us'

export class MediaStorageEngine implements StorageEngine {
  constructor(protected $log: Ha4usLogger, protected _media: DBMediaService) {
    $log.debug('Installing Storage Engine')
  }

  _handleFile(
    req: any,
    file: any,
    callback: (error?: any, info?: Partial<Express.Multer.File>) => void
  ): void {
    this.$log.debug('Handle File', req.body, file)

    const ws = this._media.getWriteStream(file.originalname, {
      contentType: file.mimetype,
      owner: req.user.username || 'system',
      description: req.body.description || '',
      tags: req.body.tags
        ? req.body.tags.split(',').map(tag => tag.trim())
        : [],
      dtl: req.body.dtl ? parseInt(req.body.dtl, 10) : undefined,
    })

    file.stream.pipe(ws)

    ws.once('finish', aFile => {
      this.$log.debug('gridfs-storage-engine: saved', aFile)
      callback(null, aFile)
    })
  }
  _removeFile(
    req: Request,
    file: Express.Multer.File,
    callback: (error: Error) => void
  ): void {
    this.$log.warn('Delete File not implemented', req.body, file)
    /*   delete file.buffer;
    if (file._id) {
       this._media.delete(file.);
    }
    cb(null);
*/
  }
}

/*
  function streamFileToGridFS(req, file, cb) {
    const data = {
      tags: [],
      expire: -1,
      owner: 'user',
    };
    defaults(req.body, data);
    ha4us.log.debug('Storing file', req.body);
    const writestream = ha4us._gfs.createWriteStream({
      filename: file.originalname,
      metadata: req.body,
      content_type: file.mimetype,
    });

    file.stream.pipe(writestream);
    writestream.on('close', function(aFile) {
      ha4us.log.info('gridfs-storage-engine: saved', aFile);
      cb(null, {
        gridfsEntry: aFile,
      });
    });
  }
  GridFSStorage.prototype._handleFile = function _handleFile(req, file, cb) {
    streamFileToGridFS(req, file, cb);
  };

  function removeFile(id) {
    ha4us._gfs.remove(
      {
        _id: id,
      },
      function(err) {
        if (err) {
          return err;
        }
        ha4us.log.info('gridfs-storage-engine: deleted file._id ', id);
      },
    );
  }

  GridFSStorage.prototype._removeFile = function _removeFile(req, file, cb) {
    delete file.buffer;
    if (file._id) {
      removeFile(file._id);
    }
    cb(null);
  };
}
*/
