import { getHarmonyClient, HarmonyClient } from '@harmonyhub/client-ws';
import { Explorer, HubData } from '@harmonyhub/discover';
import { ha4us, MqttUtil } from 'ha4us';
import { ObjectService, StateService } from 'ha4us/adapter';
import { Ha4usError, Ha4usObjectType } from 'ha4us/core';
import { Subscription } from 'rxjs';
const ADAPTER_OPTIONS = {
  name: 'harmony',
  path: __dirname + '/..',
  args: {},
  imports: ['$log', '$args', '$states', '$objects'],
};

interface HarmonyHub {
  data: HubData;
  client: HarmonyClient;
  activities: HarmonyClient.ActivityDescription[];
  config: HarmonyClient.ConfigDescription;
}

const ACTIVITY = 'activity';

function Adapter(
  $log: any,
  $args: any,
  $states: StateService,
  $objects: ObjectService
) {
  let harmonysub: Subscription;

  const explorer = new Explorer();
  const hubs = new Map<string, HarmonyHub>();

  function resolveActivity(
    hubName: string,
    activityIdOrLabel: string
  ): HarmonyClient.ActivityDescription {
    const hub = hubs.get(hubName);
    if (hub) {
      return hub.activities.find(
        activity =>
          activity.id === activityIdOrLabel ||
          activity.label === activityIdOrLabel
      );
    } else {
      throw new Ha4usError(500, `hub ${hubName} not known`);
    }
  }

  function stopHub(friendlyName: string) {
    $log.debug(`Stopping Hub ${friendlyName}`);

    if (hubs.has(friendlyName)) {
      $log.debug(`Deregister Hub ${friendlyName}`);
      const hub = hubs.get(friendlyName);
      $states.status(
        MqttUtil.join('$' + friendlyName, 'reachable'),
        false,
        true
      );
      hub.client.removeAllListeners();
      hubs.delete(friendlyName);
    }
  }

  async function $onInit() {
    async function registerHub(data: HubData) {
      $log.debug(`Registering hub ${data.friendlyName}`);
      const client = await getHarmonyClient(data.ip);

      await $objects.install(data.friendlyName, {
        type: Ha4usObjectType.Any,
        role: 'Device/HarmonyHub',
        can: { read: true, write: false, trigger: true },
      });

      await $objects.install(MqttUtil.join(data.friendlyName, 'working'), {
        type: Ha4usObjectType.Boolean,
        can: {
          read: true,
          write: false,
          trigger: true,
        },
        role: 'Indicator/System/Working',
      });
      await $objects.install(MqttUtil.join(data.friendlyName, 'reachable'), {
        type: Ha4usObjectType.Boolean,
        can: {
          read: true,
          write: false,
          trigger: true,
        },
        role: 'Indicator/System/Working',
      });
      await $objects.install(MqttUtil.join(data.friendlyName, 'remote'), {
        type: Ha4usObjectType.String,
        can: {
          read: false,
          write: true,
          trigger: false,
        },
        role: 'Value/Harmony/Command',
      });
      $states.status(
        MqttUtil.join('$' + data.friendlyName, 'reachable'),
        true,
        true
      );
      $states.status(
        MqttUtil.join('$' + data.friendlyName, 'working'),
        false,
        true
      );

      await $objects.install(MqttUtil.join(data.friendlyName, 'activity'), {
        type: Ha4usObjectType.Boolean,
        can: {
          read: true,
          write: true,
          trigger: true,
        },
        role: 'Value/Media/Activity',
      });

      const curActivity = await client.getCurrentActivity();
      const activities = await client.getActivities();
      const config = await client.getAvailableCommands();
      hubs.set(data.friendlyName, { data, client, activities, config });
      activities.forEach(async activity => {
        const topic = MqttUtil.join(
          data.friendlyName,
          ACTIVITY,
          activity.label
        );
        await $objects.install(topic, {
          type: Ha4usObjectType.Boolean,
          role: 'Toggle/Media/Activity',
        });
        $log.debug(`Installed activity ${activity.id} with ${activity.label}`);
        $states.status('$' + topic, curActivity === activity.id, true);
        if (curActivity === activity.id) {
          $states.status(
            MqttUtil.join('$' + data.friendlyName, 'activity'),
            activity.label,
            true
          );
        }
      });

      client.on(HarmonyClient.Events.STATE_DIGEST, digest => {
        if (digest.runningActivityList === '') {
          digest.runningActivityList = '-1';
        }
        $log.debug(
          `Digest for ${data.friendlyName} received`,
          digest.activityId,
          digest.activityStatus,
          digest.runningActivityList
        );

        if (digest.activityStatus === 1 || digest.activityStatus === 3) {
          $log.debug(
            'Starting activity change = working:true, deactivating running'
          );
          // the activity is working and the runningState is now false
          $states.status(
            MqttUtil.join('$' + data.friendlyName, 'working'),
            true,
            true
          );
          const activity = resolveActivity(
            data.friendlyName,
            digest.runningActivityList
          );
          $states.status(
            MqttUtil.join('$' + data.friendlyName, 'activity', activity.label),
            false,
            true
          );
        } else if (digest.runningActivityList === digest.activityId) {
          // process finished
          $log.debug(
            'Finished activity change = working:false, activate running'
          );

          const activity = resolveActivity(
            data.friendlyName,
            digest.activityId
          );
          $states.status(
            MqttUtil.join('$' + data.friendlyName, 'activity', activity.label),
            true,
            true
          );
          $states.status(
            MqttUtil.join('$' + data.friendlyName, 'activity'),
            activity.label,
            true
          );
          $states.status(
            MqttUtil.join('$' + data.friendlyName, 'working'),
            false,
            true
          );
        } else {
          $log.debug('Ignored digest');
        }
      });

      // $log.debug('Commands', commands);
      $log.debug('Client connected');
    }

    explorer.on(Explorer.Events.ONLINE, async (data: HubData) => {
      await registerHub(data);
    });

    explorer.on(Explorer.Events.OFFLINE, (data: HubData) => {
      $log.debug('Hub offline', data);
      if (hubs.has(data.friendlyName)) {
        $log.debug('Known hub is offline', data.friendlyName);
        stopHub(data.friendlyName);
      }
    });

    explorer.start();

    function startActivity(hubName: string, activityLabel: string) {
      const hub = hubs.get(hubName);
      const activity = resolveActivity(hubName, activityLabel);
      return hub.client.startActivity(activity.id);
    }

    // observing activity changes
    harmonysub = $states.observe('/$set/+/activity/+').subscribe(msg => {
      let hubName, activityLabel;
      [hubName, activityLabel] = msg.match.params;

      if (msg.val === false && activityLabel === 'PowerOff') {
        $log.warn('Not able to switch off in power off state');
        return;
      }

      if (msg.val === false) {
        activityLabel = 'PowerOff';
      }
      startActivity(hubName, activityLabel);
    });
    harmonysub.add(
      $states.observe('/$set/+/activity').subscribe(msg => {
        const [hubName] = msg.match.params;
        startActivity(hubName, msg.val);
      })
    );

    harmonysub.add(
      $states.observe('/$set/+/remote').subscribe(async msg => {
        const [hubName] = msg.match.params;
        const action = msg.val;
        $log.debug(`Action ${action} received for ${hubName}`);
        const hub = hubs.get(hubName);

        if (hub) {
          const curActivityId = await hub.client.getCurrentActivity();
          const curActivity = resolveActivity(hubName, curActivityId);
          const controls = curActivity.controlGroup;
          $log.debug('Controlgroup', controls);
          let found;
          controls.forEach(ctrl => {
            return !!ctrl.function.find(func => {
              if (func.name === action || func.label === action) {
                found = func;
                return true;
              } else {
                return false;
              }
            });
          });
          if (found) {
            $log.debug('Found', found);
            // now pressing the key
            hub.client.send('holdAction', found.action);
          } else {
            $log.warn(
              `Command ${action} not found for current activity ${
                curActivity.label
              }`
            );
          }
        } else {
          $log.warn(`Hub ${hubName} not known`);
        }
      })
    );

    return true;
  }

  async function $onDestroy() {
    harmonysub.unsubscribe();
    explorer.stop();
    hubs.forEach(hub => {
      hub.client.end();
      stopHub(hub.data.friendlyName);
    });
  }

  return {
    $onInit: $onInit,
    $onDestroy: $onDestroy,
  };
}

ha4us(ADAPTER_OPTIONS, Adapter).catch(e => {
  console.log(e);
});
