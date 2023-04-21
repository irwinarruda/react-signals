import { Stack } from "./stack";

type ContextType = (() => void) & { dispose?: () => void };

class SignalContext {
  static ctx = new Stack<ContextType>();
  static get count() {
    return this.ctx.length;
  }
  static peek() {
    return this.ctx.peek();
  }
  static push(ctx: ContextType) {
    this.ctx.push(ctx);
  }
  static pop() {
    this.ctx.pop();
  }
}

export type Accessor<T> = (() => T) & {
  set(newValue: T): void;
  update(callback: (data: T) => T): void;
};

export function createSignal<T>(initialValue?: T) {
  let subscribers = new Set<ContextType>();
  let value = initialValue as T;
  function getter() {
    if (SignalContext.count) {
      let lastCtx = SignalContext.peek()!;
      Object.defineProperty(lastCtx, "dispose", {
        value() {
          subscribers.delete(lastCtx);
        },
        writable: true,
        enumerable: true,
        configurable: true,
      });
      subscribers.add(lastCtx);
    }
    return value;
  }
  let signal = Object.assign(getter, {
    set(newValue: T) {
      value = newValue;
      for (let subscriber of subscribers) {
        subscriber();
      }
    },
    update(callback: (data: T) => T) {
      return this.set(callback(value!));
    },
  });
  return signal;
}

export function createEffect(callback: () => void) {
  const execute: ContextType = () => {
    SignalContext.push(execute);
    try {
      callback();
    } catch (err) {
      console.error("[react-signals]", err);
    } finally {
      SignalContext.pop();
    }
  };
  execute();
  return () => {
    if (execute.dispose) {
      execute.dispose();
    }
  };
}
