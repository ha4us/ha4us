$log.info('Starting script');
/*
$states.on('hm/test/',(match,message,val) => {

});
//getting via mqtt (return whole promised object, in then getValue/getProp)
let testVar = $states.get('hm/test'); //get hm/status/test from cache
testVar = $states.get('$test'); //get scripts/status/test from cached
testVar = $states.get('/hm/status/test');//get hm/status/test from cache

//getting from cache
getValue (topic);
getProp (topic,'old|ts]...') //if no prop whole object

setValue() === $states.set //
*/
/*
setTimeout(() => {
  $log.info ('TEST', getValue('$test'));
},2000);

set('$test','HALLO WELT');

link('$test','$test/replay','CIAO');
*/

sunSchedule('sunset',function (){
  $log.debug (arguments);
});

schedule('* * * * *',function (){
  $log.debug (arguments);
});

/*let config =  (await readYaml('test.yml'));

config.push('HALLO');

await writeYaml(config,'test.yml');*/

observe('$garagetest/PRESS_SHORT')
  .subscribe((msg) => {
    $log.warn ('INPUT received', msg);
  });

on ('$garagetest/STATE',(match,code,packet) => {
  $log.warn ('ON Received', match,code,packet);
})

let state = true;
setInterval(() => {
  state = !state;
  $log.warn ('Get', getValue('$garagetest/STATE'));
  set('$garagetest/STATE', state);
},10000);
