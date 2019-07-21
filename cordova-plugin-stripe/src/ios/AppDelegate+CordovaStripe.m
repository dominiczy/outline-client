#import "AppDelegate+CordovaStripe.h"
#import "CordovaStripe.h"
@import Stripe;

@implementation AppDelegate (CordovaStripe)

static NSString* const PLUGIN_NAME = @"CordovaStripe";
- (void)paymentAuthorizationViewController:(PKPaymentAuthorizationViewController *)controller didAuthorizePayment:(PKPayment *)payment completion:(void (^)(PKPaymentAuthorizationStatus))completion {
    CordovaStripe* pluginInstance = [self.viewController getCommandInstance:PLUGIN_NAME];
    if (pluginInstance != nil) {
        // Send token back to plugin
        [pluginInstance processPayment:controller didAuthorizePayment:payment completion:completion];
    } else {
        // Discard payment
        NSLog(@"Unable to get plugin instsnce, discarding payment.");
        completion(PKPaymentAuthorizationStatusFailure);
    }
}

- (void)paymentAuthorizationViewControllerDidFinish:(PKPaymentAuthorizationViewController *)controller {
    
}

// This method handles opening native URLs (e.g., "your-app://")
- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
    BOOL stripeHandled = [Stripe handleStripeURLCallbackWithURL:url];
    if (stripeHandled) {
        return YES;
    } else {
        // This was not a stripe url – do whatever url handling your app
        // normally does, if any.
    }
    return NO;
}

// This method handles opening universal link URLs (e.g., "https://example.com/stripe_ios_callback")
- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray * _Nullable))restorationHandler {
    if (userActivity.activityType == NSUserActivityTypeBrowsingWeb) {
        if (userActivity.webpageURL) {
            return YES;
        }
    }
}

@end
