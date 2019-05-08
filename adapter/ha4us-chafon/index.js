'use strict';

const ha4us = require('ha4us').ha4us;
const RfidChafon = require('rfid-chafon');


const ADAPTER_OPTIONS = {

  //h,m,u,p,l,n
  name: 'chafon',
  path: __dirname,
  args: {
    'port': {
      alias:'p',
      demandOption: true,
      describe: 'serial port eg. /dev/tty.usbserial (mac) or /dev/ttyS0',
      type: 'string'
    }
  },
  imports:['$states']
};

function Adapter($log,$args,$states) {

  let rfid;

  async function $onInit() {
    $log.info ('Starting chafon');
    rfid = new RfidChafon($args.chafonPort);

    // $states.establishCache('$#');
    $states.observe ('/$get/tag')
      .subscribe((msg) => {
        $log.debug('Getting Tag received', msg);
        rfid.open()
        	.then(()=>rfid.read())
          .then(tag => {
        			$log.debug ('Tag read',tag);
              $states.status('$tag',tag, true);
        	})
          .catch(e => {
            $states.status('$error',e, false);
        		$log.error(e);
        	})
          .then(()=>rfid.close());
      });

      $states.observe ('/$set/tag')
        .subscribe((msg) => {
          $log.debug('Set of variable received', msg);
          rfid.open()
            .then(()=>rfid.write(JSON.stringify(msg.val)))
            .then(tag => {
                $log.debug ('Tag written successfully',tag);
                $states.status('$tag',tag, true);
            })
            .catch(e => {
              $states.status('$error',e, false);
              $log.error(e);
            })
            .then(()=>rfid.close());
        });

    $states.observe ('/$set/readinterval')
          .subscribe((msg) => {
            $log.debug('Set of readinterval received', msg);
            // $states.status('$'+msg.match.params[0],msg.val, true);
    });



    $states.connected = 2;


    return true;
  }

  function $onDestroy() {
    $log.info ('Destroying chafon');
  }


  return {
    $onInit:$onInit,
    $onDestroy:$onDestroy
  };


}

ha4us(ADAPTER_OPTIONS, Adapter);
