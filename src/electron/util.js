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
const electron_1 = require("electron");
const fs = require("fs");
const fsextra = require("fs-extra");
const os = require("os");
const path = require("path");
const isWindows = os.platform() === 'win32';
const isLinux = os.platform() === 'linux';
const OUTLINE_PROXY_CONTROLLER_PATH = path.join(unpackedAppPath(), 'tools', 'outline_proxy_controller', 'dist');
const LINUX_DAEMON_FILENAME = 'OutlineProxyController';
const LINUX_DAEMON_SYSTEMD_SERVICE_FILENAME = 'outline_proxy_controller.service';
const LINUX_INSTALLER_FILENAME = 'install_linux_service.sh';
function unpackedAppPath() {
    return electron_1.app.getAppPath().replace('app.asar', 'app.asar.unpacked');
}
function pathToEmbeddedBinary(toolname, filename) {
    return path.join(unpackedAppPath(), 'third_party', toolname, os.platform(), filename + (isWindows ? '.exe' : ''));
}
exports.pathToEmbeddedBinary = pathToEmbeddedBinary;
function getServiceStartCommand() {
    if (isWindows) {
        // Locating the script is tricky: when packaged, this basically boils down to:
        //   c:\program files\Outline\
        // but during development:
        //   build/windows
        //
        // Surrounding quotes important, consider "c:\program files"!
        return `"${path.join(electron_1.app.getAppPath().includes('app.asar') ? path.dirname(electron_1.app.getPath('exe')) :
            electron_1.app.getAppPath(), 'install_windows_service.bat')}"`;
    }
    else if (isLinux) {
        return path.join(copyServiceFilesToTempFolder(), LINUX_INSTALLER_FILENAME);
    }
    else {
        throw new Error('unsupported os');
    }
}
exports.getServiceStartCommand = getServiceStartCommand;
// On some distributions, root is not allowed access the AppImage folder: copy the files to /tmp.
function copyServiceFilesToTempFolder() {
    const tmp = fs.mkdtempSync('/tmp/');
    console.log(`copying service files to ${tmp}`);
    [LINUX_DAEMON_FILENAME, LINUX_DAEMON_SYSTEMD_SERVICE_FILENAME, LINUX_INSTALLER_FILENAME].forEach((filename) => {
        const src = path.join(OUTLINE_PROXY_CONTROLLER_PATH, filename);
        // https://github.com/jprichardson/node-fs-extra/issues/323
        const dest = path.join(tmp, filename);
        fsextra.copySync(src, dest, { overwrite: true });
    });
    return tmp;
}
