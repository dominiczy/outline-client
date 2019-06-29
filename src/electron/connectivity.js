"use strict";
// Copyright 2019 The Outline Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
Object.defineProperty(exports, "__esModule", { value: true });
const dgram = require("dgram");
const dns = require("dns");
const net = require("net");
const socks = require("socks");
const util = require("../www/app/util");
const errors = require("../www/model/errors");
const CREDENTIALS_TEST_DOMAINS = ['example.com', 'ietf.org', 'wikipedia.org'];
const DNS_LOOKUP_TIMEOUT_MS = 10000;
const UDP_FORWARDING_TEST_TIMEOUT_MS = 5000;
const UDP_FORWARDING_TEST_RETRY_INTERVAL_MS = 1000;
// DNS request to google.com.
const DNS_REQUEST = Buffer.from([
    0, 0,
    1, 0,
    0, 1,
    0, 0,
    0, 0,
    0, 0,
    6, 103, 111, 111, 103, 108, 101,
    3, 99, 111, 109,
    0,
    0, 1,
    0, 1 // QCLASS, set to 1 = IN (Internet)
]);
// Uses the OS' built-in functions, i.e. /etc/hosts, et al.:
// https://nodejs.org/dist/latest-v10.x/docs/api/dns.html#dns_dns
//
// Effectively a no-op if hostname is already an IP.
function lookupIp(hostname) {
    return util.timeoutPromise(new Promise((fulfill, reject) => {
        dns.lookup(hostname, 4, (e, address) => {
            if (e) {
                return reject(new errors.ServerUnreachable('could not resolve proxy server hostname'));
            }
            fulfill(address);
        });
    }), DNS_LOOKUP_TIMEOUT_MS, 'DNS lookup');
}
exports.lookupIp = lookupIp;
// Resolves iff a (TCP) connection can be established with the specified destination within the
// specified timeout (zero means "no timeout"), optionally retrying with a delay.
function isServerReachable(host, port, timeout = 0, maxAttempts = 1, retryIntervalMs = 0) {
    let attempt = 0;
    return new Promise((fulfill, reject) => {
        const connect = () => {
            attempt++;
            const socket = new net.Socket();
            socket.once('error', () => {
                if (attempt < maxAttempts) {
                    setTimeout(connect, retryIntervalMs);
                }
                else {
                    reject(new errors.ServerUnreachable());
                }
            });
            if (timeout > 0) {
                socket.setTimeout(timeout);
            }
            socket.connect({ host, port }, () => {
                socket.end();
                fulfill();
            });
        };
        connect();
    });
}
exports.isServerReachable = isServerReachable;
// Resolves with true iff a response can be received from a semi-randomly-chosen website through the
// Shadowsocks proxy.
//
// This has the same function as ShadowsocksConnectivity.validateServerCredentials in
// cordova-plugin-outline.
function validateServerCredentials(proxyAddress, proxyIp) {
    return new Promise((fulfill, reject) => {
        const testDomain = CREDENTIALS_TEST_DOMAINS[Math.floor(Math.random() * CREDENTIALS_TEST_DOMAINS.length)];
        socks.createConnection({
            proxy: { ipaddress: proxyAddress, port: proxyIp, type: 5 },
            target: { host: testDomain, port: 80 }
        }, (e, socket) => {
            if (e) {
                reject(new errors.InvalidServerCredentials(`could not connect to remote test website: ${e.message}`));
                return;
            }
            socket.write(`HEAD / HTTP/1.1\r\nHost: ${testDomain}\r\n\r\n`);
            socket.on('data', (data) => {
                if (data.toString().startsWith('HTTP/1.1')) {
                    socket.end();
                    fulfill();
                }
                else {
                    socket.end();
                    reject(new errors.InvalidServerCredentials(`unexpected response from remote test website`));
                }
            });
            socket.on('close', () => {
                reject(new errors.InvalidServerCredentials(`could not connect to remote test website`));
            });
            // Sockets must be resumed before any data will come in, as they are paused right before
            // this callback is fired.
            socket.resume();
        });
    });
}
exports.validateServerCredentials = validateServerCredentials;
// Verifies that the remote server has enabled UDP forwarding by sending a DNS request through it.
function checkUdpForwardingEnabled(proxyAddress, proxyIp) {
    return new Promise((resolve, reject) => {
        socks.createConnection({
            proxy: { ipaddress: proxyAddress, port: proxyIp, type: 5, command: 'associate' },
            target: { host: '0.0.0.0', port: 0 },
        }, (err, socket, info) => {
            if (err) {
                reject(new errors.RemoteUdpForwardingDisabled(`could not connect to local proxy`));
                return;
            }
            const packet = socks.createUDPFrame({ host: '1.1.1.1', port: 53 }, DNS_REQUEST);
            const udpSocket = dgram.createSocket('udp4');
            udpSocket.on('error', (e) => {
                reject(new errors.RemoteUdpForwardingDisabled('UDP socket failure'));
            });
            udpSocket.on('message', (msg, info) => {
                stopUdp();
                resolve(true);
            });
            // Retry sending the query every second.
            // TODO: logging here is a bit verbose
            const intervalId = setInterval(() => {
                try {
                    udpSocket.send(packet, info.port, info.host, (err) => {
                        if (err) {
                            console.error(`Failed to send data through UDP: ${err}`);
                        }
                    });
                }
                catch (e) {
                    console.error(`Failed to send data through UDP ${e}`);
                }
            }, UDP_FORWARDING_TEST_RETRY_INTERVAL_MS);
            const stopUdp = () => {
                try {
                    clearInterval(intervalId);
                    udpSocket.close();
                }
                catch (e) {
                    // Ignore; there may be multiple calls to this function.
                }
            };
            // Give up after the timeout elapses.
            setTimeout(() => {
                stopUdp();
                resolve(false);
            }, UDP_FORWARDING_TEST_TIMEOUT_MS);
        });
    });
}
exports.checkUdpForwardingEnabled = checkUdpForwardingEnabled;
