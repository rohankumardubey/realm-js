////////////////////////////////////////////////////////////////////////////
//
// Copyright 2015 Realm Inc.
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

#import "AppDelegate.h"
#import "RCTRootView.h"

static NSString * const RealmReactEnableChromeDebuggingKey = @"RealmReactEnableChromeDebugging";
static NSString * const RCTDevMenuKey = @"RCTDevMenu";

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application willFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    NSUserDefaults *defaults = [NSUserDefaults standardUserDefaults];

    // Check if this default is explicitly set, otherwise just leave the settings as is.
    if ([defaults objectForKey:RealmReactEnableChromeDebuggingKey]) {
        NSMutableDictionary *settings = [([defaults dictionaryForKey:RCTDevMenuKey] ?: @{}) mutableCopy];
        NSMutableDictionary *domain = [[defaults volatileDomainForName:NSArgumentDomain] mutableCopy];

        settings[@"executorClass"] = [defaults boolForKey:RealmReactEnableChromeDebuggingKey] ? @"RCTWebSocketExecutor" : @"RCTContextExecutor";
        domain[RCTDevMenuKey] = settings;

        // Re-register the arguments domain (highest precedent and volatile) with our new overridden settings.
        [defaults removeVolatileDomainForName:NSArgumentDomain];
        [defaults setVolatileDomain:domain forName:NSArgumentDomain];
    }

    return YES;
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    NSURL *jsCodeLocation;

    /**
     * Loading JavaScript code - uncomment the one you want.
     *
     * OPTION 1
     * Load from development server. Start the server from the repository root:
     *
     * $ npm start
     *
     * To run on device, change `localhost` to the IP address of your computer
     * (you can get this by typing `ifconfig` into the terminal and selecting the
     * `inet` value under `en0:`) and make sure your computer and iOS device are
     * on the same Wi-Fi network.
     */

    jsCodeLocation = [NSURL URLWithString:@"http://localhost:8081/index.ios.bundle?platform=ios"];

    /**
     * OPTION 2
     * Load from pre-bundled file on disk. To re-generate the static bundle
     * from the root of your project directory, run
     *
     * $ react-native bundle --minify
     *
     * see http://facebook.github.io/react-native/docs/runningondevice.html
     */

    //   jsCodeLocation = [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];

    RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                        moduleName:@"ReactTests"
                                                 initialProperties:nil
                                                     launchOptions:launchOptions];

    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    UIViewController *rootViewController = [[UIViewController alloc] init];
    rootViewController.view = rootView;
    self.window.rootViewController = rootViewController;
    [self.window makeKeyAndVisible];
    return YES;
}

@end
