"use strict";
// Copyright 2018 The Outline Authors
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
class ServerAdded {
    constructor(server) {
        this.server = server;
    }
}
exports.ServerAdded = ServerAdded;
class ServerAlreadyAdded {
    constructor(server) {
        this.server = server;
    }
}
exports.ServerAlreadyAdded = ServerAlreadyAdded;
class ServerForgotten {
    constructor(server) {
        this.server = server;
    }
}
exports.ServerForgotten = ServerForgotten;
class ServerForgetUndone {
    constructor(server) {
        this.server = server;
    }
}
exports.ServerForgetUndone = ServerForgetUndone;
class ServerRenamed {
    constructor(server) {
        this.server = server;
    }
}
exports.ServerRenamed = ServerRenamed;
class ServerUrlInvalid {
    constructor(serverUrl) {
        this.serverUrl = serverUrl;
    }
}
exports.ServerUrlInvalid = ServerUrlInvalid;
class ServerConnected {
    constructor(server) {
        this.server = server;
    }
}
exports.ServerConnected = ServerConnected;
class ServerDisconnected {
    constructor(server) {
        this.server = server;
    }
}
exports.ServerDisconnected = ServerDisconnected;
class ServerReconnecting {
    constructor(server) {
        this.server = server;
    }
}
exports.ServerReconnecting = ServerReconnecting;
// Simple publisher-subscriber queue.
class EventQueue {
    constructor() {
        this.queuedEvents = [];
        this.listenersByEventType = new Map();
        this.isStarted = false;
        this.isPublishing = false;
    }
    startPublishing() {
        this.isStarted = true;
        this.publishQueuedEvents();
    }
    // Registers a listener for events of the type of the given constructor.
    subscribe(eventType, listener) {
        let listeners = this.listenersByEventType.get(eventType);
        if (!listeners) {
            listeners = [];
            this.listenersByEventType.set(eventType, listeners);
        }
        listeners.push(listener);
    }
    // Enqueues the given event for publishing and publishes all queued events if
    // publishing is not already happening.
    //
    // The enqueue method is reentrant: it may be called by an event listener
    // during the publishing of the events. In that case the method adds the event
    // to the end of the queue and returns immediately.
    //
    // This guarantees that events are published and handled in the order that
    // they are queued.
    //
    // There's no guarantee that the subscribers for the event have been called by
    // the time this function returns.
    enqueue(event) {
        this.queuedEvents.push(event);
        if (this.isStarted) {
            this.publishQueuedEvents();
        }
    }
    // Triggers the subscribers for all the enqueued events.
    publishQueuedEvents() {
        if (this.isPublishing)
            return;
        this.isPublishing = true;
        while (this.queuedEvents.length > 0) {
            const event = this.queuedEvents.shift();
            const listeners = this.listenersByEventType.get(event.constructor);
            if (!listeners) {
                console.warn('Dropping event with no listeners:', event);
                continue;
            }
            for (const listener of listeners) {
                listener(event);
            }
        }
        this.isPublishing = false;
    }
}
exports.EventQueue = EventQueue;
