import { fetchSwapiResourceWithKv } from "./swapiKvUtils";

// Expand an array of SWAPI URLs into { id, title }
async function expandSwapiUrls(urls: string[], env: Env) {
  return Promise.all(
    urls.map(async (url) => {
      const data = await fetchSwapiResourceWithKv(url, env);
      const id = data.url.split("/").filter(Boolean).pop();
      return { id, name: data.title || data.name };
    })
  );
}

// Expand: people/:id/with-movies
export async function getPersonWithMovies(id: string, env: Env) {
  const personUrl = `https://swapi.dev/api/people/${id}/`;
  const person = await fetchSwapiResourceWithKv(personUrl, env);

  const movies = await expandSwapiUrls(person.films, env);

  return {
    ...person,
    films: movies
  };
}

// Expand: movies/:id/with-people
export async function getMovieWithPeople(id: string, env: Env) {
  const movieUrl = `https://swapi.dev/api/films/${id}/`;
  const movie = await fetchSwapiResourceWithKv(movieUrl, env);

  const people = await expandSwapiUrls(movie.characters, env);

  return {
    ...movie,
    characters: people
  };
}