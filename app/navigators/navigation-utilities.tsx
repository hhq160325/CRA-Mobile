import {
  createNavigationContainerRef,
  NavigationAction,
  NavigationState,
  PartialState,
  StackActions,
} from '@react-navigation/native';
import {useEffect, useRef} from 'react';
import {BackHandler} from 'react-native';
import {ScreenName} from './navigation-route';

export const RootNavigation = {
  navigate(_name: string, _params?: any) {},
  replace(_name: string, _params?: any) {},
  goBack() {},
  resetRoot(_state?: PartialState<NavigationState> | NavigationState) {},
  getRootState(): NavigationState {
    return {} as any;
  },
  dispatch(_action: NavigationAction) {},
};

export const navigationRef = createNavigationContainerRef();


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
  
    const onBackPress = () => {
      if (!navigationRef.isReady()) {
        return false;
      }

  
      const routeName = getActiveRouteName(navigationRef.getRootState());

  
      if (canExitRef.current(routeName)) {
   
        return false;
      }

      
      if (navigationRef.canGoBack()) {
        navigationRef.goBack();
        return true;
      }

      return false;
    };

  
    BackHandler.addEventListener('hardwareBackPress', onBackPress);

  
    return () =>
      BackHandler.removeEventListener('hardwareBackPress', onBackPress);
  }, []);
}


export function navigate(name: ScreenName, params?: any) {
  if (navigationRef.isReady()) {
    navigationRef.navigate(name as any, params as any);
  }
}

export function replace(name: ScreenName, params?: any) {
  navigationRef.dispatch(StackActions.replace(name, params));
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  }
}

export function resetRoot(screenName: ScreenName, params: any = {}) {
  if (__DEV__) {
    console.log('Navigate To :: ', screenName);
    console.log('Navigate Param ::', params);
  }
  if (navigationRef.isReady()) {
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
      StackActions.replace('innerProfileStack', {screen: screenName}),
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
