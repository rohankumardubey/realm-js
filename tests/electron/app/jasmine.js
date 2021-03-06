////////////////////////////////////////////////////////////////////////////
//
// Copyright 2021 Realm Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
////////////////////////////////////////////////////////////////////////////

const Jasmine = require("jasmine");
const JasmineConsoleReporter = require("jasmine-console-reporter");
const path = require("path");
const process = require("process");

const SPEC_PATH = path.join(__dirname, "..", "spec.js");

const ADMIN_TOKEN_PATH = path.join(__dirname, "..", "..", "..", "object-server-for-testing", "admin_token.base64");
process.env.ADMIN_TOKEN_PATH = ADMIN_TOKEN_PATH;

// console.log(require.resolve("realm-spec-helpers"));
exports.execute = (filter) => {
  const jasmine = new Jasmine();

  // The tests expect to be in the realm-js/tests directory
  process.chdir(path.join(__dirname, "..", ".."));

  global.REALM_MODULE_PATH = path.resolve(__dirname, "../node_modules/realm");
  process.env.ELECTRON_TESTS_REALM_MODULE_PATH = global.REALM_MODULE_PATH;
  process.env.REALM_ELECTRON_VERSION = process.versions.electron;

  jasmine.clearReporters();
  jasmine.addReporter(
    new JasmineConsoleReporter({
      colors: 0,
      cleanStack: 3,
      verbosity: 4,
      activity: false,
    }),
  );
  jasmine.execute([SPEC_PATH], filter);

  return jasmine;
};
