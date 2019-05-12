'use strict';
const topic = 'garage/code';
const isOpenTopic = 'hm/Garage/Offen/STATE';
const topicOpener = 'hm/Garage/Taster/PRESS_SHORT';

const dataFile = './garage.yml';

const DEFAULT_ENTRY = {
  user:'unbekannt',
  access:false
}

async function getConfig() {
  let config={
    'taghash':{user:'unbekannt', access:false}
  };

  try {
    config = await readYaml(dataFile);
  }
  catch (e)  {
    $log.info ('Problems reading garage file',e);
  }
  return config;
}


on(topic,async (match, code, packet) => {
  let {token} = code;
  $log.info ('Match', token);
  let config = await getConfig();
  if (config.hasOwnProperty(token)) {
    let myEntry = config[token];
    $log.info ('Doing with rights', token, myEntry.access);
    let openState = getValue(isOpenTopic);
    $log.info ('Garage open?', openState);
    if (myEntry.access ===true || myEntry.access ==='open') {
      $log.info ('Opening Garage for',  myEntry.user, token);
      set(topicOpener,true);
    }
  }
  else {
    config[token]={user:'unbekannt', access:false};
    writeYaml(config, dataFile);
  }
})
