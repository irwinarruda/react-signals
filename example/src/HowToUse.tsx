import { useState } from "react";
import { useSignal, useReactSignal, withSignal } from "react-signals";

const WithSignal = withSignal(() => {
  const count = useSignal(0);
  return (
    <button onClick={() => count.update((count) => count + 1)}>
      count is {count()}
    </button>
  );
});

function ReactSignal() {
  const count = useReactSignal(0);
  return (
    <button onClick={() => count.update((count) => count + 1)}>
      count is {count()}
    </button>
  );
}

export function HowToUse() {
  const [show, set] = useState(false);
  return (
    <>
      <h1>How to use</h1>
      <button onClick={() => set((prev) => !prev)}>Trigger</button>
      <div className="card">
        {show && <WithSignal />}
        <WithSignal />
        <ReactSignal />
      </div>
    </>
  );
}
