# ha4us-scripts

> ha4us-scripts is a Node.js based script runner for use in ha4us based smart home environments.

In the current version it is basically a copy of mqtt-scripts developed by [Sebastian Raff](https://github.com/hobbyquaker) aka hobbyquaker.

## Needed methods in scripts

### states
* _set_ Setting a datapoint (emits mqtt XYZ/set/....)
* _get_ observes the last status (options: timeout=1s, active:false - emits a get)
* _getCached_ gets the last value from cache (sync, since it's only does a internal lookup)
* status - emits a status of current scriptDomain topic (optionally retained)

### scheduler

#### Use cases
* turn on in the morning:  
  at ( 'sunset','06:30').subscribe(onNext(_idx_, _array of params__));
  cron('* * * * *')

# License

MIT ©2017 Ulf Steinberg    
MIT ©2015 [Sebastian Raff](https://github.com/hobbyquaker)

[mit-badge]: https://img.shields.io/badge/License-MIT-blue.svg?style=flat
[mit-url]: LICENSE
