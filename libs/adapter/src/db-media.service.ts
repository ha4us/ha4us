import { createHash } from 'crypto';
import { createReadStream } from 'fs';
import * as globby from 'globby';
import * as mime from 'mime-types';
import { GridFSBucket, ObjectId } from 'mongodb';
import * as path from 'path';
import * as request from 'request';
import * as got from 'got';
import axios from 'axios';

import { from } from 'rxjs';
import { filter, map, mergeMap, toArray } from 'rxjs/operators';
import { Stream, Readable } from 'stream';
import {
  defaultsDeep,
  Ha4usError,
  Ha4usLogger,
  Ha4usMedia,
  Ha4usMediaDefinition,
  IPager,
} from '@ha4us/core';
import { Ha4usMongoAccess } from './lib/ha4us-mongo-access';

const MIME_REGEX = /^(?=[-a-z]{1,127}\/[-\.a-z0-9]{1,127})[a-z]+(-[a-z]+)*\/[a-z0-9]+([-\.][a-z0-9]+)*/;

const DEFAULT_MEDIA: Ha4usMediaDefinition = {
  tags: [],
  owner: 'system',
  dtl: -1,
  description: '',
};

/**
 * creates a gridfs filestructrue for uploading to database
 * @param                              filename filename
 * @param                              media mediadefinition
 * @return                             a gridfs file structure
 */
export function mediaToFile(
  filename: string,
  media: Partial<Ha4usMediaDefinition> = {}
): any {
  media = defaultsDeep(media, DEFAULT_MEDIA);

  if (media.contentType) {
    const match = media.contentType.match(MIME_REGEX);
    media.contentType = match ? match[0] : media.contentType;
  } else {
    const lu = mime.lookup(filename);
    media.contentType = lu ? lu : '';
  }

  return {
    filename: media.filename || filename,
    content_type: media.contentType,
    mode: 'w',
    metadata: {
      tags: media.tags,
      owner: media.owner,
      description: media.description,
      expires:
        media.dtl > 0
          ? new Date(new Date().valueOf() + media.dtl * 1000 * 60 * 60 * 24)
          : undefined,
    },
  };
}
/**
 * converts a document stored in grid fs to ha4usmedia
 * @param           doc Document stored in database
 * @return      resulting Ha4usMedia
 */
export function fileToHa4usMedia(doc: any): Ha4usMedia {
  const id = doc._id.toString();

  doc.metadata = doc.metadata || {};
  return {
    id,
    urn: 'urn:ha4us:media:' + id,
    filename: doc.filename,
    description: doc.metadata.description,
    tags: doc.metadata.tags,
    contentType: doc.contentType,
    length: doc.length,
    expires: doc.metadata.expires,
    uploadDate: doc.uploadDate,
    owner: doc.metadata.owner,
    md5: doc.md5,
  };
}

export class DBMediaService extends Ha4usMongoAccess {
  public static readonly urn = 'urn:ha4us:media';
  protected gfs: GridFSBucket;

  constructor(protected $log: Ha4usLogger, $args: { dbUrl: string }) {
    super($args.dbUrl, 'fs.files');
  }

  public connect() {
    return super.connect().then(db => {
      this.gfs = new GridFSBucket(db);
      return db;
    });
  }

  public getWriteStream(
    filename: string,
    media: Partial<Ha4usMediaDefinition>
  ) {
    const file = mediaToFile(filename, media);
    // this.$log.debug('getting write stream for', file)

    const options = {
      contentType: media.contentType,
      metadata: file.metadata,
    };

    if (media.id) {
      return this.gfs.openUploadStreamWithId(
        new ObjectId(media.id),
        media.filename || filename,
        options
      );
    } else {
      return this.gfs.openUploadStream(filename, options);
    }
  }

  public getReadStream(fileObj: any = {}): Stream {
    this.$log.debug('Getting readstream for id', fileObj.id);
    return this.gfs.openDownloadStream(new ObjectId(fileObj.id));
  }

  public getByFilename(filename: string): Promise<Ha4usMedia> {
    this.$log.debug('Getting file by name from Database', filename);
    return this.gfs
      .find({
        filename: filename,
      })
      .toArray()
      .then((file: Ha4usMedia[]) => {
        if (file.length) {
          return fileToHa4usMedia(file[0]);
        } else {
          throw new Ha4usError(404, `file ${filename} not found`);
        }
      });
  }

  public getById(id: string): Promise<Ha4usMedia> {
    this.$log.debug('Getting file by id from Database', id);
    return this.gfs
      .find({ _id: new ObjectId(id) })
      .toArray()
      .then((file: Ha4usMedia[]) => {
        if (file.length) {
          return fileToHa4usMedia(file[0]);
        } else {
          throw new Ha4usError(404, `media ${id} not found`);
        }
      });
  }

  public postFile(
    filename: string,
    mediadata?: Partial<Ha4usMediaDefinition>
  ): Promise<Ha4usMedia> {
    const ws = this.getWriteStream(filename, mediadata);
    const rs = createReadStream(filename);

    rs.pipe(ws);

    return new Promise<Ha4usMedia>((resolve, reject) => {
      ws.once('error', e => reject(e));
      ws.once('finish', aFile => resolve(fileToHa4usMedia(aFile)));
    }).catch(e => Ha4usError.wrapErr(e));
  }

  public postString(
    filename: string,
    data: Buffer,
    mediadata?: Partial<Ha4usMediaDefinition>
  ): Promise<Ha4usMedia> {
    // Create stream with buffer to pipe to writestream
    const ws = this.getWriteStream(filename, mediadata);
    const rs = new Readable();
    rs.push(data);
    rs.push(null); // Push null to end stream
    rs.pipe(ws);

    return new Promise<Ha4usMedia>((resolve, reject) => {
      ws.once('error', e => reject(e));
      ws.once('finish', aFile => resolve(fileToHa4usMedia(aFile)));
    }).catch(e => Ha4usError.wrapErr(e));
  }

  public postUrl(
    url: string,
    media?: Partial<Ha4usMediaDefinition>
  ): Promise<Ha4usMedia> {
    return axios.get(url, { responseType: 'stream' }).then(response => {
      media.contentType = response.headers['content-type'];
      this.$log.debug(response.headers);
      const writestream = this.getWriteStream(url, media);

      return new Promise<Ha4usMedia>((resolve, reject) => {
        response.data.pipe(writestream);
        writestream.once('finish', file => {
          this.$log.debug('gridfs-storage-engine: saved', file.filename);
          resolve(fileToHa4usMedia(file));
        });
      });
    });
  }

  public getMediaFromUrl(url: string): Promise<string> {
    return axios.get(url, { responseType: 'arraybuffer' }).then(response => {
      return 'data:;base64,' + response.data.toString('base64');
    });
  }

  public delete(idOrMime: string, tags: string[] = []): Promise<void> {
    if (/^[a-f\d]{24}$/i.test(idOrMime)) {
      return new Promise((resolve, reject) => {
        this.gfs.delete(new ObjectId(idOrMime), err => {
          if (err) {
            reject(err);
          }
          resolve();
        });
      });
    } else {
      return from(this.get(idOrMime, tags))
        .pipe(
          mergeMap((data: Ha4usMedia[]) => from(data)),
          mergeMap(data => this.delete(data.id))
        )
        .toPromise();
    }
  }

  public get(
    contentTypePattern: string,
    tags?: string[]
  ): Promise<Ha4usMedia[]>;
  public get(
    contentTypePattern: string,
    tags: string[],
    page: number,
    pagesize?: number
  ): Promise<IPager<Ha4usMedia>>;
  public async get(
    contentTypePattern: string = '*',
    tags: string[] = [],
    page: number = -1,
    pagesize: number = 10
  ): Promise<Ha4usMedia[] | IPager<Ha4usMedia>> {
    const query: any = {};

    if (tags.length > 0) {
      query['metadata.tags'] = {
        $all: tags.map(tag => new RegExp('^' + tag + '$', 'i')),
      };
    }

    query.contentType = new RegExp(contentTypePattern.replace('*', '.*'));

    this.$log.debug(
      'GetContentType %s ->',
      contentTypePattern,
      query.contentType.toString()
    );
    this.$log.debug('GetTags', tags, query.metadata);

    const cursor = this.gfs.find(query);

    if (page === -1) {
      return cursor.toArray().then(docs => docs.map(fileToHa4usMedia));
    }

    const count = await cursor.count();

    page = Math.max(1, Math.min(page, Math.ceil(count / pagesize)));

    const result = await cursor
      .skip((page - 1) * pagesize)
      .limit(pagesize)
      .toArray();
    return {
      length: count,
      pageSize: pagesize,
      page: page,
      pages: Math.ceil(count / pagesize),
      data: result.map(fileToHa4usMedia),
    };
  }

  public async expire(): Promise<any> {
    const now = Date();
    const ids = await this.collection
      .find({
        'metadata.expires': { $lt: now },
      })
      .toArray();

    return Promise.all(ids.map(doc => this.delete(doc._id.toString()))).then(
      result => result.length
    );
  }

  public async put(media: Ha4usMedia): Promise<any> {
    return this.collection.update(
      {
        _id: new ObjectId(media.id),
      },
      {
        $set: {
          filename: media.filename,
          'metadata.description': media.description,
          'metadata.tags': media.tags,
        },
      }
    );
  }

  createHash(prefix: string, data: any) {
    const nameHash = createHash('md5')
      .update(data)
      .digest('hex');
    return [
      prefix.toUpperCase(),
      nameHash.substr(0, 12 - prefix.length - 1),
    ].join('_');
  }

  public async import(
    glob: string,
    wd: string
  ): Promise<{ count: number; imported: Ha4usMedia[] }> {
    wd = path.normalize(wd);

    const files = await globby(glob, {
      cwd: wd,
      absolute: true,
    });
    const regex = new RegExp('^' + wd + '/');

    const fileCount = files.length;
    return from(files)
      .pipe(
        mergeMap(file => {
          const fileName = file.replace(regex, '');

          const tags = path
            .dirname(fileName)
            .split(path.sep)
            .map(tag => '#' + tag);

          const id = this.createHash('HA4US', fileName);

          const mediaData = {
            id,
            filename: fileName,
            tags,
          };
          return this.postFile(file, mediaData).catch(e => {
            if (e.code === 409) {
              return undefined;
            } else {
              throw Ha4usError.wrapErr(e);
            }
          });
        }, 1),
        filter(data => !!data),
        toArray(),
        map((imported: Ha4usMedia[]) => {
          return {
            count: fileCount,
            imported,
          };
        })
      )
      .toPromise();
  }
}
