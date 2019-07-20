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
class OutlineError extends Error {
    constructor(message) {
        // ref:
        // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget
        super(message); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = new.target.name;
    }
}
exports.OutlineError = OutlineError;
class ServerAlreadyAdded extends OutlineError {
    constructor(server) {
        super();
        this.server = server;
    }
}
exports.ServerAlreadyAdded = ServerAlreadyAdded;
class ServerIncompatible extends OutlineError {
    constructor(message) {
        super(message);
    }
}
exports.ServerIncompatible = ServerIncompatible;
class ServerUrlInvalid extends OutlineError {
    constructor(message) {
        super(message);
    }
}
exports.ServerUrlInvalid = ServerUrlInvalid;
class OperationTimedOut extends OutlineError {
    constructor(timeoutMs, operationName) {
        super();
        this.timeoutMs = timeoutMs;
        this.operationName = operationName;
    }
}
exports.OperationTimedOut = OperationTimedOut;
class FeedbackSubmissionError extends OutlineError {
    constructor() {
        super();
    }
}
exports.FeedbackSubmissionError = FeedbackSubmissionError;
// Error thrown by "native" code.
//
// Must be kept in sync with its Cordova doppelganger:
//   cordova-plugin-outline/outlinePlugin.js
//
// TODO: Rename this class, "plugin" is a poor name since the Electron apps do not have plugins.
class OutlinePluginError extends OutlineError {
    constructor(errorCode) {
        super();
        this.errorCode = errorCode;
    }
}
exports.OutlinePluginError = OutlinePluginError;
// Marker class for errors originating in native code.
// Bifurcates into two subclasses:
//  - "expected" errors originating in native code, e.g. incorrect password
//  - "unexpected" errors originating in native code, e.g. unhandled routing table
class NativeError extends OutlineError {
}
exports.NativeError = NativeError;
class RegularNativeError extends NativeError {
}
exports.RegularNativeError = RegularNativeError;
class RedFlagNativeError extends NativeError {
}
exports.RedFlagNativeError = RedFlagNativeError;
//////
// "Expected" errors.
//////
class UnexpectedPluginError extends RegularNativeError {
}
exports.UnexpectedPluginError = UnexpectedPluginError;
class VpnPermissionNotGranted extends RegularNativeError {
}
exports.VpnPermissionNotGranted = VpnPermissionNotGranted;
class InvalidServerCredentials extends RegularNativeError {
}
exports.InvalidServerCredentials = InvalidServerCredentials;
class RemoteUdpForwardingDisabled extends RegularNativeError {
}
exports.RemoteUdpForwardingDisabled = RemoteUdpForwardingDisabled;
class ServerUnreachable extends RegularNativeError {
}
exports.ServerUnreachable = ServerUnreachable;
class IllegalServerConfiguration extends RegularNativeError {
}
exports.IllegalServerConfiguration = IllegalServerConfiguration;
class NoAdminPermissions extends RegularNativeError {
}
exports.NoAdminPermissions = NoAdminPermissions;
class SystemConfigurationException extends RegularNativeError {
}
exports.SystemConfigurationException = SystemConfigurationException;
//////
// Now, "unexpected" errors.
// Use these sparingly because each occurrence triggers a Sentry report.
//////
// Windows.
class ShadowsocksStartFailure extends RedFlagNativeError {
}
exports.ShadowsocksStartFailure = ShadowsocksStartFailure;
class ConfigureSystemProxyFailure extends RedFlagNativeError {
}
exports.ConfigureSystemProxyFailure = ConfigureSystemProxyFailure;
class UnsupportedRoutingTable extends RedFlagNativeError {
}
exports.UnsupportedRoutingTable = UnsupportedRoutingTable;
// Used on Android and Apple to indicate that the plugin failed to establish the VPN tunnel.
class VpnStartFailure extends RedFlagNativeError {
}
exports.VpnStartFailure = VpnStartFailure;
// Converts an ErrorCode - originating in "native" code - to an instance of the relevant
// OutlineError subclass.
// Throws if the error code is not one defined in ErrorCode or is ErrorCode.NO_ERROR.
function fromErrorCode(errorCode) {
    switch (errorCode) {
        case 1 /* UNEXPECTED */:
            return new UnexpectedPluginError();
        case 2 /* VPN_PERMISSION_NOT_GRANTED */:
            return new VpnPermissionNotGranted();
        case 3 /* INVALID_SERVER_CREDENTIALS */:
            return new InvalidServerCredentials();
        case 4 /* UDP_RELAY_NOT_ENABLED */:
            return new RemoteUdpForwardingDisabled();
        case 5 /* SERVER_UNREACHABLE */:
            return new ServerUnreachable();
        case 6 /* VPN_START_FAILURE */:
            return new VpnStartFailure();
        case 7 /* ILLEGAL_SERVER_CONFIGURATION */:
            return new IllegalServerConfiguration();
        case 8 /* SHADOWSOCKS_START_FAILURE */:
            return new ShadowsocksStartFailure();
        case 9 /* CONFIGURE_SYSTEM_PROXY_FAILURE */:
            return new ConfigureSystemProxyFailure();
        case 10 /* NO_ADMIN_PERMISSIONS */:
            return new NoAdminPermissions();
        case 11 /* UNSUPPORTED_ROUTING_TABLE */:
            return new UnsupportedRoutingTable();
        case 12 /* SYSTEM_MISCONFIGURED */:
            return new SystemConfigurationException();
        default:
            throw new Error(`unknown ErrorCode ${errorCode}`);
    }
}
exports.fromErrorCode = fromErrorCode;
// Converts a NativeError to an ErrorCode.
// Throws if the error is not a subclass of NativeError.
function toErrorCode(e) {
    if (e instanceof UnexpectedPluginError) {
        return 1 /* UNEXPECTED */;
    }
    else if (e instanceof VpnPermissionNotGranted) {
        return 2 /* VPN_PERMISSION_NOT_GRANTED */;
    }
    else if (e instanceof InvalidServerCredentials) {
        return 3 /* INVALID_SERVER_CREDENTIALS */;
    }
    else if (e instanceof RemoteUdpForwardingDisabled) {
        return 4 /* UDP_RELAY_NOT_ENABLED */;
    }
    else if (e instanceof ServerUnreachable) {
        return 5 /* SERVER_UNREACHABLE */;
    }
    else if (e instanceof VpnStartFailure) {
        return 6 /* VPN_START_FAILURE */;
    }
    else if (e instanceof IllegalServerConfiguration) {
        return 7 /* ILLEGAL_SERVER_CONFIGURATION */;
    }
    else if (e instanceof ShadowsocksStartFailure) {
        return 8 /* SHADOWSOCKS_START_FAILURE */;
    }
    else if (e instanceof ConfigureSystemProxyFailure) {
        return 9 /* CONFIGURE_SYSTEM_PROXY_FAILURE */;
    }
    else if (e instanceof UnsupportedRoutingTable) {
        return 11 /* UNSUPPORTED_ROUTING_TABLE */;
    }
    else if (e instanceof NoAdminPermissions) {
        return 10 /* NO_ADMIN_PERMISSIONS */;
    }
    else if (e instanceof SystemConfigurationException) {
        return 12 /* SYSTEM_MISCONFIGURED */;
    }
    throw new Error(`unknown NativeError ${e.name}`);
}
exports.toErrorCode = toErrorCode;
