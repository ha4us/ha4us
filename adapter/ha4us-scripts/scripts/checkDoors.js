'use strict';
$log.error ('Startup Script');


const contactsToObserve = [
  {topic:'scripts/test/fenster1',
    label:'Fenster Eins'},
  {topic:'scripts/test/fenster2',
    label:'Fenster Zwei'},
  {topic:'scripts/test/fenster3',
    label:'Fenster Drei'},
];
const valueToCount = false;

Rx.Observable.combineLatest(contactsToObserve.map((obj) => (
    observe(obj.topic).map((state) => {
      state.label = obj.label;
      return state;
    }).startWith({label:obj.label, val:undefined})
  )))
  .map((states) => {
    return states.filter((state) => (state.val===valueToCount));
  })
  .subscribe((openContacts) => {
    $log.debug('Result',openContacts);
    set('$openContacts',openContacts);
    if (openContacts.length > 0) {
      $log.info ('Windows/Doors Open - Set Led to red');
    }
    else {
      $log.info ('All Windows/Doors Closed - Set Led to green');
    }
  });
