/*$states.observe('$#')
  .subscribe((message) => {
    $log.debug ('Incoming', message);
  });

xy
link('test/test1', 'test/test2',(val) => {
  $log.debug ('Trigger Link');
  return val*2;
});

setTimeout(() => {
  $log.debug ('Getting', getValue('harmdev/Hannover/activity'));

},5000);*/

const { tap } = require('rxjs/operators');

log.debug('Goodbye');

const path = require('path');

console.log('my path %s', path.resolve('./test'));

console.log(__dirname);

observe('/#')
  .pipe(
    noRetained,
    pick('topic'),
    tap(() => {
      console.debug('TEST');
    }),
  )
  .subscribe((msg) => {
    console.debug(msg);
  });

async function test() {
  await set('test/test1', true);
  await set('test/test1', true);
  status('Tanker', 1.23, true);

  var cfg = await load('./confidential.yml');
  cfg.test = 'HALLO WELT';
  save(cfg, 'test.yml');

  var html = await getHTML(
    'https://www.stadtreinigung.hamburg/privatkunden/abfuhrkalender/index.html',
    {
      asId: cfg.asId,
      hnId: cfg.hnId,
      bestaetigung: true,
      mode: 'search'
    },
  );

  html('tr', '#abfuhrkalender').each((idx, element) => {
    let text = html(element).text();
    const test = text.match(/(\d\d\.\d\d\.\d\d\d\d)(?:\s*?\n\s*)(.*)/m);
    //console.log (test[1],test[2]);
  });
}

console.log('Ping2');
var sub = schedule('*/2 * * * * *').subscribe(() => {
  console.log('Ping2');
});

$onDestroy(() => {
  console.log('Destroying', this);
  sub.unsubscribe();
  sub.unsubscribe();
  sub.unsubscribe();
});
