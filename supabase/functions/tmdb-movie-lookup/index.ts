import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

type MediaType = "movie" | "tv"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

const responseHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json; charset=utf-8",
}

const jsonResponse = (
  data: Record<string, unknown>,
  status = 200,
) =>
  new Response(JSON.stringify(data), {
    status,
    headers: responseHeaders,
  })

const tmdbImageUrl = (
  path: string | null | undefined,
  size = "original",
) =>
  path
    ? `https://image.tmdb.org/t/p/${size}${path}`
    : null

async function tmdbRequest(
  path: string,
  accessToken: string,
) {
  const response = await fetch(
    `https://api.themoviedb.org/3${path}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        accept: "application/json",
      },
    },
  )

  let data: any = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  return {
    response,
    data,
  }
}

function uniqueNames(names: string[]) {
  return [...new Set(names.filter(Boolean))]
}

function getCertification(
  data: any,
  mediaType: MediaType,
) {
  if (mediaType === "movie") {
    const countries =
      data.release_dates?.results ?? []

    const us =
      countries.find(
        (country: any) =>
          country.iso_3166_1 === "US",
      )

    const preferred =
      us?.release_dates ??
      countries.flatMap(
        (country: any) =>
          country.release_dates ?? [],
      )

    return (
      preferred.find(
        (release: any) =>
          Boolean(release.certification),
      )?.certification ?? null
    )
  }

  const ratings =
    data.content_ratings?.results ?? []

  const us =
    ratings.find(
      (rating: any) =>
        rating.iso_3166_1 === "US" &&
        rating.rating,
    )

  if (us?.rating) {
    return us.rating
  }

  return (
    ratings.find(
      (rating: any) =>
        Boolean(rating.rating),
    )?.rating ?? null
  )
}

function normalizeDetails(
  data: any,
  mediaType: MediaType,
) {
  const credits = data.credits ?? {}

  const crew = Array.isArray(credits.crew)
    ? credits.crew
    : []

  const byJob = (job: string) =>
    crew
      .filter(
        (person: any) =>
          person.job === job,
      )
      .map(
        (person: any) =>
          person.name,
      )
      .filter(Boolean)

  const directors =
    uniqueNames(byJob("Director"))

  const writers =
    uniqueNames([
      ...byJob("Writer"),
      ...byJob("Screenplay"),
      ...byJob("Story"),
      ...byJob("Teleplay"),
    ])

  const producers =
    uniqueNames([
      ...byJob("Producer"),
      ...byJob("Executive Producer"),
    ])

  const trailers =
    (data.videos?.results ?? [])
      .filter(
        (video: any) =>
          video.site === "YouTube",
      )

  const trailer =
    trailers.find(
      (video: any) =>
        video.type === "Trailer" &&
        video.official === true,
    ) ??
    trailers.find(
      (video: any) =>
        video.type === "Trailer",
    ) ??
    trailers.find(
      (video: any) =>
        video.type === "Teaser",
    )

  const releaseDate =
    mediaType === "tv"
      ? data.first_air_date ?? ""
      : data.release_date ?? ""

  let runtime: number | null = null

  if (mediaType === "movie") {
    runtime =
      typeof data.runtime === "number"
        ? data.runtime
        : null
  } else {
    runtime =
      data.episode_run_time?.[0] ??
      data.last_episode_to_air?.runtime ??
      null
  }

  const title =
    mediaType === "tv"
      ? data.name ?? ""
      : data.title ?? ""

  const originalTitle =
    mediaType === "tv"
      ? data.original_name ?? ""
      : data.original_title ?? ""

  const creators =
    mediaType === "tv"
      ? (data.created_by ?? [])
          .map(
            (creator: any) =>
              creator.name,
          )
          .filter(Boolean)
          .join(", ")
      : ""

  const imdbId =
    data.external_ids?.imdb_id ?? null

  const certification =
    getCertification(
      data,
      mediaType,
    )

  return {
    mediaType,

    tmdbId:
      data.id ?? null,

    imdbId,

    title,

    originalTitle,

    originalLanguage:
      data.original_language ?? "",

    overview:
      data.overview ?? "",

    tagline:
      data.tagline ?? "",

    releaseDate,

    year:
      releaseDate
        ? Number(
            String(releaseDate).slice(
              0,
              4,
            ),
          )
        : null,

    runtime,

    rating:
      typeof data.vote_average === "number"
        ? Number(
            data.vote_average.toFixed(1),
          )
        : null,

    voteCount:
      data.vote_count ?? null,

    genres:
      (data.genres ?? [])
        .map(
          (genre: any) =>
            genre.name,
        )
        .filter(Boolean)
        .join(", "),

    cast:
      (credits.cast ?? [])
        .slice(0, 18)
        .map(
          (person: any) =>
            person.character
              ? `${person.name} — ${person.character}`
              : person.name,
        )
        .filter(Boolean)
        .join("\n"),

    directors:
      directors.join(", "),

    writers:
      writers.join(", "),

    producers:
      producers.join(", "),

    creators,

    productionCompanies:
      (data.production_companies ?? [])
        .map(
          (company: any) =>
            company.name,
        )
        .filter(Boolean)
        .join(", "),

    productionCountries:
      (data.production_countries ?? [])
        .map(
          (country: any) =>
            country.name,
        )
        .filter(Boolean)
        .join(", "),

    spokenLanguages:
      (data.spoken_languages ?? [])
        .map(
          (language: any) =>
            language.english_name ??
            language.name,
        )
        .filter(Boolean)
        .join(", "),

    budget:
      mediaType === "movie"
        ? data.budget || null
        : null,

    revenue:
      mediaType === "movie"
        ? data.revenue || null
        : null,

    certification,

    status:
      data.status ?? null,

    numberOfSeasons:
      mediaType === "tv"
        ? data.number_of_seasons ?? null
        : null,

    numberOfEpisodes:
      mediaType === "tv"
        ? data.number_of_episodes ?? null
        : null,

    trailerUrl:
      trailer?.key
        ? `https://www.youtube.com/watch?v=${trailer.key}`
        : null,

    posterUrl:
      tmdbImageUrl(
        data.poster_path,
        "w780",
      ),

    backdropUrl:
      tmdbImageUrl(
        data.backdrop_path,
        "original",
      ),

    tmdbUrl:
      mediaType === "tv"
        ? `https://www.themoviedb.org/tv/${data.id}`
        : `https://www.themoviedb.org/movie/${data.id}`,

    imdbUrl:
      imdbId
        ? `https://www.imdb.com/title/${imdbId}/`
        : null,
  }
}

Deno.serve(async (request) => {
  /*
   * CORS
   */
  if (request.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    })
  }

  if (request.method !== "POST") {
    return jsonResponse(
      {
        error:
          "Only POST requests are supported.",
      },
      405,
    )
  }

  try {
    /*
     * AUTHORIZATION
     */
    const authorization =
      request.headers.get(
        "Authorization",
      )

    if (!authorization) {
      return jsonResponse(
        {
          error:
            "ავტორიზაცია აუცილებელია.",
        },
        401,
      )
    }

    const jwt =
      authorization.replace(
        /^Bearer\s+/i,
        "",
      )

    if (!jwt) {
      return jsonResponse(
        {
          error:
            "ავტორიზაციის Token ვერ მოიძებნა.",
        },
        401,
      )
    }

    const supabaseUrl =
      Deno.env.get("SUPABASE_URL")

    const supabaseAnonKey =
      Deno.env.get(
        "SUPABASE_ANON_KEY",
      )

    if (
      !supabaseUrl ||
      !supabaseAnonKey
    ) {
      console.error(
        "Supabase environment variables are missing.",
      )

      return jsonResponse(
        {
          error:
            "Supabase კონფიგურაცია ვერ მოიძებნა.",
        },
        500,
      )
    }

    const supabase =
      createClient(
        supabaseUrl,
        supabaseAnonKey,
      )

    const {
      data: { user },
      error: userError,
    } =
      await supabase.auth.getUser(
        jwt,
      )

    if (
      userError ||
      !user
    ) {
      console.error(
        "Authentication error:",
        userError,
      )

      return jsonResponse(
        {
          error:
            "სესია არ არის ვალიდური.",
        },
        401,
      )
    }

    /*
     * TMDB TOKEN
     */
    const accessToken =
      Deno.env.get(
        "TMDB_ACCESS_TOKEN",
      )

    if (!accessToken) {
      return jsonResponse(
        {
          error:
            "TMDb API ჯერ არ არის კონფიგურირებული.",
        },
        503,
      )
    }

    /*
     * BODY
     */
    let body: any

    try {
      body =
        await request.json()
    } catch {
      return jsonResponse(
        {
          error:
            "მოთხოვნის JSON არასწორია.",
        },
        400,
      )
    }

    let action =
      String(
        body.action ?? "",
      )
        .trim()
        .toLowerCase()

    let query =
      String(
        body.query ?? "",
      ).trim()

    let mediaId =
      body.movieId ??
      body.mediaId ??
      null

    let mediaType:
      | MediaType
      | undefined =
      body.mediaType === "tv"
        ? "tv"
        : body.mediaType === "movie"
          ? "movie"
          : undefined

    /*
     * თუ action არ გამოგზავნეს,
     * მაგრამ query არსებობს,
     * ავტომატურად lookup რეჟიმი.
     */
    if (
      !action &&
      query
    ) {
      action = "lookup"
    }

    /*
     * LOOKUP
     */
    if (action === "lookup") {
      if (!query) {
        return jsonResponse(
          {
            error:
              "IMDb ან TMDb ბმული მიუთითეთ.",
          },
          400,
        )
      }

      /*
       * IMDb:
       *
       * https://www.imdb.com/title/tt28093628/
       * ან პირდაპირ:
       * tt28093628
       */
      const imdbId =
        query.match(
          /(?:imdb\.com\/title\/|\b)(tt\d{5,})/i,
        )?.[1]

      /*
       * TMDb Movie
       */
      const tmdbMovieId =
        query.match(
          /themoviedb\.org\/movie\/(\d+)/i,
        )?.[1]

      /*
       * TMDb TV
       */
      const tmdbTvId =
        query.match(
          /themoviedb\.org\/tv\/(\d+)/i,
        )?.[1]

      /*
       * IMDb → TMDb
       */
      if (imdbId) {
        const {
          response:
            findResponse,
          data:
            matches,
        } =
          await tmdbRequest(
            `/find/${imdbId}?external_source=imdb_id&language=en-US`,
            accessToken,
          )

        if (
          !findResponse.ok
        ) {
          console.error(
            "TMDb IMDb lookup failed:",
            findResponse.status,
            matches,
          )

          return jsonResponse(
            {
              error:
                "IMDb ბმულის მოძებნა TMDb-ში ვერ მოხერხდა.",
            },
            502,
          )
        }

        const movieMatch =
          matches
            ?.movie_results?.[0]

        const tvMatch =
          matches
            ?.tv_results?.[0]

        /*
         * ჯერ Movie.
         * თუ Movie არ არის,
         * ვამოწმებთ TV Series-ს.
         */
        if (movieMatch?.id) {
          mediaId =
            movieMatch.id

          mediaType =
            "movie"
        } else if (
          tvMatch?.id
        ) {
          mediaId =
            tvMatch.id

          mediaType =
            "tv"
        } else {
          return jsonResponse(
            {
              error:
                "ამ IMDb ბმულისთვის ფილმი ან სერიალი TMDb-ში ვერ მოიძებნა.",
            },
            404,
          )
        }

        action =
          "details"
      }

      /*
       * პირდაპირ TMDb Movie URL
       */
      else if (
        tmdbMovieId
      ) {
        mediaId =
          Number(
            tmdbMovieId,
          )

        mediaType =
          "movie"

        action =
          "details"
      }

      /*
       * პირდაპირ TMDb TV URL
       */
      else if (
        tmdbTvId
      ) {
        mediaId =
          Number(
            tmdbTvId,
          )

        mediaType =
          "tv"

        action =
          "details"
      }

      /*
       * ჩვეულებრივი ტექსტია →
       * Search
       */
      else {
        action =
          "search"
      }
    }

    /*
     * SEARCH
     *
     * ძველ ფუნქციონალთან
     * თავსებადობისთვის აქ ძირითადად
     * ფილმებს ვეძებთ.
     */
    if (action === "search") {
      if (
        query.length < 2
      ) {
        return jsonResponse(
          {
            error:
              "მიუთითეთ ფილმის მინიმუმ ორი სიმბოლო.",
          },
          400,
        )
      }

      const {
        response,
        data,
      } =
        await tmdbRequest(
          `/search/movie?language=en-US&include_adult=false&query=${encodeURIComponent(query)}`,
          accessToken,
        )

      if (!response.ok) {
        console.error(
          "TMDb search failed:",
          response.status,
          data,
        )

        return jsonResponse(
          {
            error:
              "TMDb-ში ძებნა ვერ მოხერხდა.",
          },
          502,
        )
      }

      const results =
        (
          data?.results ??
          []
        )
          .slice(0, 8)
          .map(
            (
              movie: any,
            ) => ({
              id:
                movie.id,

              mediaType:
                "movie",

              title:
                movie.title ??
                "",

              originalTitle:
                movie.original_title ??
                "",

              releaseDate:
                movie.release_date ??
                "",

              overview:
                movie.overview ??
                "",

              posterUrl:
                tmdbImageUrl(
                  movie.poster_path,
                  "w342",
                ),
            }),
          )

      return jsonResponse({
        results,
      })
    }

    /*
     * DETAILS
     */
    if (
      action === "details"
    ) {
      const numericId =
        Number(mediaId)

      if (
        !Number.isInteger(
          numericId,
        ) ||
        numericId <= 0
      ) {
        return jsonResponse(
          {
            error:
              "არასწორი TMDb ID.",
          },
          400,
        )
      }

      /*
       * თუ mediaType უკვე ვიცით,
       * პირდაპირ შესაბამის endpoint-ზე
       * მივდივართ.
       */
      if (mediaType) {
        const path =
          mediaType === "tv"
            ? `/tv/${numericId}?language=en-US&append_to_response=credits,external_ids,content_ratings,videos`
            : `/movie/${numericId}?language=en-US&append_to_response=credits,external_ids,release_dates,videos`

        const {
          response,
          data,
        } =
          await tmdbRequest(
            path,
            accessToken,
          )

        if (!response.ok) {
          console.error(
            "TMDb details failed:",
            response.status,
            data,
          )

          return jsonResponse(
            {
              error:
                "TMDb-დან ინფორმაციის მიღება ვერ მოხერხდა.",
            },
            response.status ===
                404
              ? 404
              : 502,
          )
        }

        const movie =
          normalizeDetails(
            data,
            mediaType,
          )

        return jsonResponse({
          movie,
        })
      }

      /*
       * ძველ Frontend-თან თავსებადობა:
       *
       * თუ mediaType არ გამოგზავნილა,
       * ჯერ Movie-ს ვამოწმებთ.
       */
      const movieAttempt =
        await tmdbRequest(
          `/movie/${numericId}?language=en-US&append_to_response=credits,external_ids,release_dates,videos`,
          accessToken,
        )

      if (
        movieAttempt
          .response.ok
      ) {
        return jsonResponse({
          movie:
            normalizeDetails(
              movieAttempt.data,
              "movie",
            ),
        })
      }

      /*
       * Movie ვერ მოიძებნა →
       * TV Series ვამოწმებთ.
       */
      if (
        movieAttempt
          .response.status ===
        404
      ) {
        const tvAttempt =
          await tmdbRequest(
            `/tv/${numericId}?language=en-US&append_to_response=credits,external_ids,content_ratings,videos`,
            accessToken,
          )

        if (
          tvAttempt
            .response.ok
        ) {
          return jsonResponse({
            movie:
              normalizeDetails(
                tvAttempt.data,
                "tv",
              ),
          })
        }
      }

      console.error(
        "TMDb details lookup failed:",
        movieAttempt
          .response.status,
        movieAttempt.data,
      )

      return jsonResponse(
        {
          error:
            "TMDb-დან ინფორმაციის მიღება ვერ მოხერხდა.",
        },
        502,
      )
    }

    return jsonResponse(
      {
        error:
          "არასწორი მოთხოვნა.",
      },
      400,
    )
  } catch (error) {
    console.error(
      "tmdb-movie-lookup error:",
      error,
    )

    return jsonResponse(
      {
        error:
          "სერვერის შეცდომა.",
      },
      500,
    )
  }
})
