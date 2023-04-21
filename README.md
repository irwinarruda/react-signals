# React Signals

A study to check if it is possible to use signals in React.

## Explanation

With signals, there are usually a `createSignal` and `createEffect` function.

- `createSignal` is responsible to create the state variable and to notify all subscribers when changed.
- `createEffect` is the subscriber functions that get injected into a signal if there is a signal call inside the function.

To use this concept in React, we have to bind the `createEffect` subscribers to a state variable so that when the signal changes, we can call a state variable triggering rerender.

There are two approaches to do that. **Atomic hook** or **Higher-Order Component**.

### Atomic Hook

Here is an example of how I implemented signals with an atomic hook

```ts
export function useReactSignal<T>(initialValue?: T) {
  // The state used to trigger rerender when needed.
  const trigger = useTrigger();
  // Created with a memo so that it doesn't get recreated.
  const signal = useMemo(() => createSignal(initialValue), []);
  useEffect(() => {
    // We only need to read the signal variable once so that the effect is subscribed.
    let isFirstRender = true;
    return createEffect(() => {
      if (!isFirstRender) {
        // If it's not the first render, we just trigger.
        trigger();
      } else {
        signal();
        isFirstRender = false;
      }
    });
  }, []);
  return signal;
}
```

The downside of this approach is that for every signal, one, and only one effect is going to be created.

### Higher-Order Component

Here is an example of how I implemented signals with a Higher-Order Components (heavily inspired by [Mobx React Lite](https://github.com/mobxjs/mobx))

```tsx
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
  // In order to not break the rules of hooks, we can call the render function only once in the createEffect
  // to register the signals. The subsequent calls just triggers rerenders.
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
    // When the component umounts and mounts again we make sure that the effects are recreated accordingly.
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

// Example
export const Example = withSignal(() => {
  const count = useSignal(0);
  return (
    <button onClick={() => count.set(count() + 1)}>Increment: {count()}</button>
  );
});
```
