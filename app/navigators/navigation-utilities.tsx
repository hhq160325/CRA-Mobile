import {
  createNavigationContainerRef,
  NavigationAction,
  NavigationState,
  PartialState,
  StackActions,
} from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import { ScreenName } from './navigation-route';

export const RootNavigation = {
  navigate(_name: string, _params?: any) { },
  replace(_name: string, _params?: any) { },
  goBack() { },
  resetRoot(_state?: PartialState<NavigationState> | NavigationState) { },
  getRootState(): NavigationState {
    return {} as any;
  },
  dispatch(_action: NavigationAction) { },
};

export const navigationRef = createNavigationContainerRef<any>();


export function getActiveRouteName(
  state: NavigationState | PartialState<NavigationState>,
): any {
  if (state?.index) {
    const route = state.routes[state.index];


    if (!route.state) {
      return route.name;
    }


    return getActiveRouteName(route.state);
  }
  return null;
}


export function useBackButtonHandler(canExit: (routeName: string) => boolean) {
  const canExitRef = useRef(canExit);

  useEffect(() => {
    canExitRef.current = canExit;
  }, [canExit]);

  useEffect(() => {
    // Enhanced back button handler with cache clearing
    const onBackPress = async () => {
      if (!navigationRef.isReady()) {
        return false;
      }

      // Get current route name
      const routeName = getActiveRouteName(navigationRef.getRootState());

      // COMPREHENSIVE FIX: Clear cache on back navigation to important screens
      const shouldClearCache = [
        'Home', 'StaffScreen', 'Bookings', 'Cars', 'Profile'
      ].includes(routeName);

      if (shouldClearCache) {
        try {
          const { apiCache } = require('../../lib/api/cache');
          console.log(`🧹 Back navigation from ${routeName} - clearing cache for fresh data`);
          await apiCache.clearAll();
          console.log(`✅ Cache cleared for back navigation from ${routeName}`);
        } catch (error) {
          console.warn('Failed to clear cache during back navigation:', error);
        }
      }

      // Check if we can exit the app
      if (canExitRef.current(routeName)) {
        // Allow default back button behavior (exit app)
        return false;
      }

      // Navigate back if possible
      if (navigationRef.canGoBack()) {
        navigationRef.goBack();
        return true;
      }

      return false;
    };

    // Subscribe to hardware back button
    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

    // Cleanup subscription
    return () => subscription.remove();
  }, []);
}


export function navigate(name: ScreenName, params?: any) {
  if (navigationRef.isReady()) {
    // COMPREHENSIVE FIX: Clear cache before navigation to important screens
    const shouldClearCache = [
      'Home', 'StaffScreen', 'Bookings', 'Cars', 'Profile', 'PaymentHistory'
    ].includes(name);

    if (shouldClearCache) {
      try {
        const { apiCache } = require('../../lib/api/cache');
        console.log(`🧹 Navigate to ${name} - clearing cache for fresh data`);
        apiCache.clearAll().then(() => {
          console.log(`✅ Cache cleared for navigation to ${name}`);
        }).catch((error: any) => {
          console.warn('Failed to clear cache during navigation:', error);
        });
      } catch (error) {
        console.warn('Failed to clear cache during navigation:', error);
      }
    }

    navigationRef.navigate(name as any, params as any);
  }
}

export function replace(name: ScreenName, params?: any) {
  navigationRef.dispatch(StackActions.replace(name, params));
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    // COMPREHENSIVE FIX: Clear cache when going back to ensure fresh data
    try {
      const { apiCache } = require('../../lib/api/cache');
      console.log('🧹 Go back - clearing cache for fresh data');
      apiCache.clearAll().then(() => {
        console.log('✅ Cache cleared for go back navigation');
      }).catch((error: any) => {
        console.warn('Failed to clear cache during go back:', error);
      });
    } catch (error) {
      console.warn('Failed to clear cache during go back:', error);
    }

    navigationRef.goBack();
  }
}

export function resetRoot(screenName: ScreenName, params: any = {}) {
  if (__DEV__) {
    console.log('Navigate To :: ', screenName);
    console.log('Navigate Param ::', params);
  }

  if (navigationRef.isReady()) {
    // COMPREHENSIVE FIX: Clear cache before reset navigation
    const shouldClearCache = [
      'Home', 'StaffScreen', 'Bookings', 'Cars', 'Profile'
    ].includes(screenName);

    if (shouldClearCache) {
      try {
        const { apiCache } = require('../../lib/api/cache');
        console.log(`🧹 Reset to ${screenName} - clearing cache for fresh data`);
        apiCache.clearAll().then(() => {
          console.log(`✅ Cache cleared for reset to ${screenName}`);
        }).catch((error: any) => {
          console.warn('Failed to clear cache during reset:', error);
        });
      } catch (error) {
        console.warn('Failed to clear cache during reset:', error);
      }
    }

    navigationRef.reset({
      index: 0,
      routes: [
        {
          name: screenName,
          params,
        },
      ],
    });
  }
}

export function popToTop() {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.popToTop());
  }
}

export function navigateDispatch(screenName: string) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(
      StackActions.replace('innerProfileStack', { screen: screenName }),
    );
  }
}

export function navigatePush(screenName: string, params: any = {}) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(StackActions.push(screenName, params));
  }
}

export interface INaivgationParam {
  screen?: ScreenName;
  params?: any;
}
