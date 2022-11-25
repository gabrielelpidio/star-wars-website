import type { PaginatedResponse } from "./../../../types/swapi/paginated";
import type { APIRoute } from "astro";
import type { People } from "../../../types/swapi/people";

//API Route to search characters
export const get: APIRoute = async ({ params, request }) => {
  const { search } = params;
  const data = await fetch(
    `${import.meta.env.API_URL}/people/?search=${search}`
  ).then((res) => res.json() as Promise<PaginatedResponse<People>>);

  // Adds id and replaces url to be used in
  const parsedResults = data.results.map((result) => {
    return {
      ...result,
      url: new URL(
        result.url.split("/api/").at(-1) || "",
        new URL(request.url).origin
      ),
      id: result.url.split("/people").at(-1)?.replaceAll("/", ""),
    };
  });

  return {
    body: JSON.stringify({ ...data, results: parsedResults }),
  };
};
