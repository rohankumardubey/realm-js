////////////////////////////////////////////////////////////////////////////
//
// Copyright 2020 Realm Inc.
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
import Realm from "realm";

// Either the sync property is left out (local Realm)
type LocalConfiguration = Omit<Realm.Configuration, "sync"> & { sync?: never };
// Or the sync parameter is present
export type SyncedConfiguration = Omit<Realm.Configuration, "sync"> & {
  sync?: Partial<Realm.SyncConfiguration>;
};

export async function openRealm(
  partialConfig: LocalConfiguration | SyncedConfiguration = {},
  user: Realm.User,
  nonce?: string,
): Promise<{ config: Realm.Configuration; realm: Realm; nonce: string }> {
  if (!nonce) nonce = new Realm.BSON.ObjectID().toHexString();
  const path = `temp-${nonce}.realm`;

  if (!partialConfig.sync) {
    const config = { ...partialConfig, path } as LocalConfiguration;
    return { config, realm: new Realm(config), nonce };
  } else {
    const config = {
      ...partialConfig,
      path,
      sync: {
        user: user,
        ...(partialConfig.sync.flexible ? { flexible: true } : { partitionValue: nonce }),
        _sessionStopPolicy: "immediately",
        ...partialConfig.sync,
      },
    } as Realm.Configuration;
    const realm = new Realm(config);

    // Upload the schema, ensuring a valid connection
    if (!config.sync?.flexible) {
      if (!realm.syncSession) {
        throw new Error("No syncSession found on realm");
      }

      await realm.syncSession.uploadAllLocalChanges();
    }

    return { config, realm, nonce };
  }
}

export function openRealmHook(config: LocalConfiguration | SyncedConfiguration = {}) {
  return async function openRealmHandler(this: Partial<RealmContext> & Mocha.Context): Promise<void> {
    if (this.realm) {
      throw new Error("Unexpected realm on context, use only one openRealmBefore per test");
    } else {
      const result = await openRealm(config, this.user);

      this.realm = result.realm;
      this.config = result.config;
      // TODO neater way to do this? "reopen realm" call?
      this.nonce = result.nonce;
    }
  };
}

export function closeRealm(realm: Realm, config: Realm.Configuration): void {
  realm.close();
  Realm.deleteFile(config);

  // Clearing the test state to ensure the sync session gets completely reset and nothing is cached between tests
  Realm.clearTestState();
}

export function closeThisRealm(this: Partial<RealmContext> & Mocha.Context): void {
  if (!this.realm) {
    throw new Error("Expected a 'realm' to close");
  }
  if (!this.config) {
    throw new Error("Expected a 'config' to close");
  }

  closeRealm(this.realm, this.config);

  delete this.realm;
  delete this.config;
}

export function closeAndReopenRealm(realm: Realm, config: Realm.Configuration): Realm {
  // Close, delete and download the Realm from the server
  realm.close();
  // Delete the file
  Realm.deleteFile(config);
  // Re-open a new Realm with the old configuration
  return new Realm(config);
}

export function openRealmBeforeEach(config: LocalConfiguration | SyncedConfiguration = {}): void {
  beforeEach(openRealmHook(config));
  afterEach(closeThisRealm);
}

export function openRealmBefore(config: LocalConfiguration | SyncedConfiguration = {}): void {
  before(openRealmHook(config));
  after(closeThisRealm);
}
