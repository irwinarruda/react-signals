import { useRef, useState, useMemo, useEffect } from "react";

import { createEffect, createSignal } from "./signal";

function useTrigger() {
  const [_, set] = useState(false);
  return () => set((prev) => !prev);
}

export function withSignal<P extends object>(
  Component: React.FunctionComponent<P>
) {
  const signalComponent = (props: P) => {
    return useComponentWithSignal(() => Component(props));
  };
  (signalComponent as React.FunctionComponent).displayName =
    Component.displayName;
  return signalComponent as (props: P) => React.ReactElement<any, any>;
}

function useComponentWithSignal<T>(render: () => T) {
  const trigger = useTrigger();
  const element = useRef<T>();
  const dispose = useRef<() => void>();
  if (!dispose.current) {
    dispose.current = createEffect(() => {
      if (dispose.current) {
        trigger();
        return;
      }
      element.current = render();
    });
  } else {
    element.current = render();
  }
  useEffect(() => {
    return () => {
      if (dispose.current) {
        dispose.current();
        dispose.current = undefined;
        trigger();
      }
    };
  }, []);
  return element.current;
}

export function useSignal<T>(initialValue?: T) {
  const signal = useMemo(() => createSignal(initialValue), []);
  return signal;
}

export function useReactSignal<T>(initialValue?: T) {
  const trigger = useTrigger();
  const signal = useMemo(() => createSignal(initialValue), []);
  useEffect(() => {
    let isFirstRender = true;
    return createEffect(() => {
      if (!isFirstRender) {
        trigger();
      } else {
        signal();
        isFirstRender = false;
      }
    });
  }, []);
  return signal;
}
