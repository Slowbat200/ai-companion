'use client';

import qs from 'query-string';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChangeEventHandler, useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

export const SearchInput = () => {
  //hooks and states
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('categoryId');
  const name = searchParams.get('name');

  /* The line `const [value, setValue] = useState(name || '');` is using the `useState` hook to create
  a state variable called `value` and a corresponding setter function called `setValue`. */
  const [value, setValue] = useState(name || '');

  /* The line `const debauncedValue = useDebounce<string>(value, 500)` is using a custom hook called
  `useDebounce` to debounce the value of the search input. Debouncing is a technique used to delay
  the execution of a function until after a certain amount of time has passed since the last time
  the function was called. */
  const debauncedValue = useDebounce<string>(value, 500);

  /**
   * The above function is a TypeScript React function that handles the onChange event for an input
   * element and updates the value state.
   * @param e - The parameter `e` is an event object that represents the change event triggered by the
   * input element.
   */
  const onChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    setValue(e.target.value);
  };

  useEffect(() => {
    /* The code `const query = { name: debauncedValue, categoryId: categoryId };` is creating an object
    called `query` with two properties: `name` and `categoryId`. */
    const query = {
      name: debauncedValue,
      categoryId: categoryId,
    };

    /* The code `const url = qs.stringifyUrl({ url: window.location.href, query }, {skipEmptyString:
   true, skipNull: true})` is using the `qs` library to stringify the URL with the given query
   parameters. */
    const url = qs.stringifyUrl(
      {
        /* The code `url: window.location.href` is setting the `url` property of the `qs.stringifyUrl`
        function to the current URL of the window. This ensures that the new URL generated will have
        the same base URL as the current page. */
        url: window.location.href,
        query,
      },
      { skipEmptyString: true, skipNull: true }
    );

    router.push(url);
  }, [debauncedValue, router, categoryId]);

  return (
    <div className='relative'>
      <Search className='absolute h-4 w-4 top-3 left-4 text-muted-foreground' />
      <Input onChange={onChange} value={value} placeholder='Search...' className='pl-10 bg-primary/10' />
    </div>
  );
};

export default SearchInput;
