# ha4us

>Important! This is personal, educational project just for me - you can use it on your own risk!

Starting with a small homematic installation, some years ago I started with [ccu.io](https://hobbyquaker.github.io/ccu.io/). As this project was shutdown in favour of [iobroker](http://iobroker.net/) I was really excited about the planned architecture (using a standard message-broker and a standard database), but unfortunately the developer team decided to go back to a file based approach and an internal message bus.



At this time I decided mainly from a educational point, to write my own home automation solution based on [MQTT](https://de.wikipedia.org/wiki/MQTT) and a document-oriented database (first I choose [CouchDb](http://couchdb.apache.org/) nowadays I switched to [MongoDb](https://www.mongodb.com)). But I have to admit, that iobroker is still the most complete and versatile home automation solution I've seen (and i tried a lot) and the guys on the project do a admirable job.

My first approach was to realize a single process with a couple of adapters that were loaded into the main process with gui based on AngularJs, storing all kind of objects in the database. I took me quite a while to achieve a MVP with homematic, sonos, logitech harmony, fritzbox, charting, history, scripts, schedulers and a lot more and I came to the point, that the whole system was getting too complicated and too fragile when replacing one single adapter (a lot of side effects). So I started over again and began a more modular approach following the [mqtt-smarthome architecture](https://github.com/mqtt-smarthome).

So every adapter is a own process only communicating via mqtt and supplies either a wrapper around a piece of hardware, represents a graphical user interface or capsules a piece of logic.

### Content

This repository here is the base class for all adapters in the ha4us-univers and encapsulates following functionality:
* **configuration** (via environment variables or command line parameters)
* **database access** to mongo db (when needed by the adapter)
* **logging** to console
* **yml file access**
* and most important the **mqtt** handling
It standardizes the startup and shutdown behaviour of an adapter and tries to ensure the architectural compliance to the system.

Additionally there are some more helpers (also usable in the web). E.g.:
* mqtt topic pattern matching
* mqtt topic manipulation (split, join, insert)
* value mapping

### My personal educational goals
* learn javascript (more or less done)
* learn nodejs (for me ok)
* learn typescript (in progress)
* learn document-oriented databases (for me ok)
* learn AngularJs and Angular (still in progress)
* learn ReactiveX (currently my favorite subject)
* learn continuos integration (still open)
* learn docker (in progress)
* ....

### Overview of current and planned adapters with status

| Adapter        | Description                                       | Status  |
| -------------- |:--------------------------------------------------| ------- |
| hm | homematic adapter | published |
| hue | adapter for philips hue | published |
| landroid | adapter for auto mower from landroid | published |
| scripts | adapter for logic execution | first version |
| history | persisting history of state changes | first version |
| gui | angular gui for ha4us | in work |
| harmony | Logitech Harmony | in work |
| chafon | Adapter for the chafon usb rfid reader/writer | done |
| sonos | Sonos System | planned |
| fritz | Fritzbox  | planned |
| blepresence | A bluetooth le adapter to scan beacons  | planned |
| alexa | Alexa adapter | planned |
| homekit | Apple homekit adapter | idea |
| telegram | Telegram bot interface | idea |
| pm2 | Monitor for pm2 processes| idea |
| wiegand | Adapter for a wiegand rasbperry pie rfid reader | idea |
| macros/scenes | Create Macros/Scenes a simple scripts | idea |

### More features that will be added somewhen / somewhere
* ~~Groups (Rooms, function groups like switches, blinds....)~~ replaced by tagging of objects (so no groups!)




## Getting Started

This package is only used for building new adapters. So please look in the adapter repositories.



### Installing

For using the module just install via npm.


```
npm install ha4us
```
And start coding

## Versioning
I try to use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

* **ulfalfa** - *Initial work* - [Ulfafa](https://github.com/ulfalfa)


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

I bow down to the especially to [hobbyquaker](http://hobbyquaker.github.io/), since he was the main inspiration for this project
* with creating ccu.io
* with starting iobroker (and bringing the idea of central bus and database)
* with leaving iobroker and
* going with this modular approach [mqtt-smarthome architecture](https://github.com/mqtt-smarthome)
