"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = require("axios");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
class Landroid {
    constructor(ip, pin) {
        this.ip = ip;
        this.pin = pin;
    }
    readDebug() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.doGet('Debug');
        });
    }
    readData() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.doGet('data');
        });
    }
    doGet(what) {
        return __awaiter(this, void 0, void 0, function* () {
            return axios_1.default
                .get(`http://${this.ip}:80/json${what}.cgi`, {
                auth: {
                    username: 'admin',
                    password: this.pin,
                },
            })
                .then(data => {
                return data.data;
            })
                .catch(e => {
                if (e.response.status === 404) {
                    throw new Error(`landroid not found (${this.ip})`);
                }
                throw e;
            });
        });
    }
    doPost(request) {
        return __awaiter(this, void 0, void 0, function* () {
            return axios_1.default
                .post(`http://${this.ip}:80/jsondata.cgi`, request, {
                headers: {
                    'content-length': request.length,
                    'content-type': 'application/x-www-form-urlencoded',
                    Accept: 'application/json',
                },
                auth: {
                    username: 'admin',
                    password: this.pin,
                },
            })
                .then(result => result.data.state);
        });
    }
    start() {
        return this.doPost('data=[["settaggi", 11, 1]]');
    }
    stop() {
        return this.doPost('data=[["settaggi", 12, 1]]');
    }
    observe(anInterval = 5) {
        return rxjs_1.interval(anInterval * 1000).pipe(operators_1.switchMap(() => {
            return rxjs_1.combineLatest([this.readData(), this.readDebug()]).pipe(operators_1.map(data => ({ data: data[0], debug: data[1] })));
        }));
    }
}
exports.Landroid = Landroid;
//# sourceMappingURL=landroid.js.map