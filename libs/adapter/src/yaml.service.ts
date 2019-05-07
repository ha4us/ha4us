'use strict';

import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';
import { promisify } from 'util';
import { Ha4usLogger } from '@ha4us/core';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

export class YamlService {
  constructor(protected $log: Ha4usLogger) {}

  async load(fileName, filePath: string = null) {
    filePath = filePath || process.cwd();
    const file = path.resolve(filePath, fileName);
    this.$log.debug('loading yaml %s', file);
    const ymlContent = await readFile(file, 'utf-8');

    try {
      return yaml.safeLoad(ymlContent);
    } catch (error) {
      this.$log.error('Error reading %s:', file, error.message);
      throw error;
    }
  }

  async save(myObject, fileName, options: { filePath?: string } = {}) {
    options.filePath = options.filePath || process.cwd();
    const file = path.resolve(options.filePath, fileName);
    this.$log.debug('saving yaml %s', file);

    try {
      const ymlContent = yaml.safeDump(myObject);
      return await writeFile(file, ymlContent);
    } catch (error) {
      this.$log.error('Error saving %s:', file, error.message);
      throw error;
    }
  }
}
