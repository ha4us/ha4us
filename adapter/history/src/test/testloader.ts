import * as yaml from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

import { randomString, Ha4usMessage, defaultsDeep } from '@ha4us/core';

const readFile = promisify(fs.readFile);

export async function loadFile(filename: string) {
  const file = path.resolve(__dirname, filename);
  const ymlContent = await readFile(file, 'utf-8');
  return yaml.safeLoad(ymlContent);
}

export async function loadMessages(
  topic: string,
  filename: string
): Promise<Ha4usMessage[]> {
  const DEF_MSG = {
    topic,
    retain: false,
  };

  const data = await loadFile(filename);

  return data.map(msg => {
    msg.ts = msg.ts.toISOString();
    return defaultsDeep(msg, DEF_MSG);
  }) as Ha4usMessage[];
}
