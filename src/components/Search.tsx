import * as React from "react";
import { useCombobox } from "downshift";
import useSWR from "swr";
import clsx from "clsx";
import type { PaginatedResponse } from "../types/swapi/paginated";
import type { People } from "../types/swapi/people";

/**
 * Props to:
 * https://gist.github.com/ca0v/73a31f57b397606c9813472f7493a940?permalink_comment_id=4307328#gistcomment-4307328
 */

function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  delay: number
): (...args: Parameters<F>) => void {
  let timeout: number;
  return (...args: Parameters<F>): void => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
}

const BASE_URL = typeof window !== "undefined" && window.location.origin;
const API_URL = BASE_URL && new URL("/api/people", BASE_URL);

const fetcher = (...args: [RequestInfo, RequestInit]) =>
  fetch(...args).then((res) => res.json());

/**
 *
 * Search
 */
export function Search() {
  const [searchTerm, setSearchTerm] = React.useState<string>();
  const { data, isValidating } = useSWR<
    PaginatedResponse<People & { id: string }>
  >(searchTerm ? `${API_URL}/${searchTerm}.json` : null, fetcher);

  const debouncedSetSearchTerm = React.useCallback(
    debounce(setSearchTerm, 500),
    []
  );

  const {
    isOpen,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
  } = useCombobox({
    onInputValueChange({ inputValue }) {
      debouncedSetSearchTerm(inputValue);
    },
    itemToString(item) {
      return item?.name || "";
    },
    items: data?.results || [],
  });
  return (
    <div className="relative w-full">
      <label className="sr-only" {...getLabelProps()}>
        Search a character
      </label>

      <input
        placeholder="Search a character"
        className="w-full rounded-full bg-zinc-800 px-4 py-1 outline-none outline-yellow-500 placeholder:text-zinc-600 focus-visible:outline-yellow-600"
        {...getInputProps()}
      />

      <ul
        {...getMenuProps()}
        className={clsx(
          "absolute right-0 left-0 mt-2 max-h-80 overflow-y-auto rounded-lg  border border-zinc-700 bg-zinc-800 shadow-md empty:border-none"
        )}
      >
        {isOpen && (
          <>
            {isValidating && !data && (
              <li className="pointer-events-none p-2">Searching...</li>
            )}
            {data?.results?.map((item, index) => {
              return (
                <li key={`${item.url}`} {...getItemProps({ item, index })}>
                  <a
                    href={item.url}
                    className={clsx(
                      highlightedIndex === index && "bg-zinc-600",
                      "block cursor-pointer p-2"
                    )}
                  >
                    <span>{item.name}</span>
                  </a>
                </li>
              );
            })}
          </>
        )}
      </ul>
    </div>
  );
}
