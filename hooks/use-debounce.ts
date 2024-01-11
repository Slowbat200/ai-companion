import { useEffect, useState } from 'react';

/**
 * The useDebounce function is a custom hook in TypeScript React that delays the execution of a
 * function until a certain amount of time has passed since the last time it was called.
 * @param {T} value - The value that you want to debounce. This can be of any type.
 * @param {number} [delay] - The `delay` parameter is an optional number that specifies the delay in
 * milliseconds before the debounced value is updated. If no delay is provided, the default delay is
 * used.
 */
export function useDebounce<T>(value: T, delay?: number): T {
  /* `const [debouncedValue, setDebouncedValue] = useState<T>(value);` is declaring a state variable
called `debouncedValue` and a function to update it called `setDebouncedValue`. The initial value of
`debouncedValue` is set to the `value` passed as an argument to the `useDebounce` hook. The type of
`debouncedValue` is inferred as `T` based on the generic type parameter provided when using the
hook. */
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  /* The `useEffect` hook is used to perform side effects in a functional component. In this case, it
  is used to debounce the `value` passed to the `useDebounce` hook. */

  useEffect(() => {
    /* The line `const timer = setTimeout(() => setDebouncedValue(value), delay || 500);` is creating a
timer using the `setTimeout` function. The timer is set to delay the execution of the callback
function `() => setDebouncedValue(value)` by the specified `delay` in milliseconds. If no `delay` is
provided, it defaults to 500 milliseconds. */
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  return debouncedValue;
}
