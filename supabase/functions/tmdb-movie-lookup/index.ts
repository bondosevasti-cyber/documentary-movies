import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors"

const responseHeaders = { ...corsHeaders, "Content-Type": "application/json" }

const tmdbImageUrl = (path: string | null, size = "original") =>
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null

serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders })
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Only POST requests are supported." }), { status: 405, headers: responseHeaders })
  }

  try {
    const authorization = request.headers.get("Authorization")
    if (!authorization) {
      return new Response(JSON.stringify({ error: "ავტორიზაცია აუცილებელია." }), { status: 401, headers: responseHeaders })
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authorization } } },
    )
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "სესია არ არის ვალიდური." }), { status: 401, headers: responseHeaders })
    }

    const accessToken = Deno.env.get("TMDB_ACCESS_TOKEN")
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "TMDb API ჯერ არ არის კონფიგურირებული." }), { status: 503, headers: responseHeaders })
    }

    let { action, query, movieId } = await request.json()
    let endpoint: string

    if (action === "lookup") {
      const value = String(query ?? "").trim()
      const imdbId = value.match(/(?:imdb\.com\/title\/|\b)(tt\d{5,})/i)?.[1]
      const tmdbId = value.match(/themoviedb\.org\/movie\/(\d+)/i)?.[1]

      if (imdbId) {
        const findResponse = await fetch(
          `https://api.themoviedb.org/3/find/${imdbId}?external_source=imdb_id&language=en-US`,
          { headers: { Authorization: `Bearer ${accessToken}`, accept: "application/json" } },
        )
        if (!findResponse.ok) throw new Error("IMDb ბმულის მოძებნა ვერ მოხერხდა.")
        const matches = await findResponse.json()
        const match = matches.movie_results?.[0]
        if (!match?.id) {
          return new Response(JSON.stringify({ error: "ამ IMDb ბმულისთვის ფილმი TMDb-ში ვერ მოიძებნა." }), { status: 404, headers: responseHeaders })
        }
        movieId = match.id
        action = "details"
      } else if (tmdbId) {
        movieId = Number(tmdbId)
        action = "details"
      } else {
        action = "search"
      }
    }

    if (action === "search") {
      const searchQuery = String(query ?? "").trim()
      if (searchQuery.length < 2) {
        return new Response(JSON.stringify({ error: "მიუთითეთ ფილმის მინიმუმ ორი სიმბოლო." }), { status: 400, headers: responseHeaders })
      }
      endpoint = `https://api.themoviedb.org/3/search/movie?language=en-US&include_adult=false&query=${encodeURIComponent(searchQuery)}`
    } else if (action === "details" && Number.isInteger(Number(movieId))) {
      endpoint = `https://api.themoviedb.org/3/movie/${Number(movieId)}?language=en-US&append_to_response=credits,external_ids,release_dates,videos`
    } else {
      return new Response(JSON.stringify({ error: "არასწორი მოთხოვნა." }), { status: 400, headers: responseHeaders })
    }

    const tmdbResponse = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${accessToken}`, accept: "application/json" },
    })
    if (!tmdbResponse.ok) {
      const detail = await tmdbResponse.text()
      console.error("TMDb request failed", tmdbResponse.status, detail)
      return new Response(JSON.stringify({ error: "TMDb-დან ინფორმაციის მიღება ვერ მოხერხდა." }), { status: 502, headers: responseHeaders })
    }

    const tmdbData = await tmdbResponse.json()
    if (action === "search") {
      const results = (tmdbData.results ?? []).slice(0, 8).map((movie: Record<string, unknown>) => ({
        id: movie.id,
        title: movie.title,
        originalTitle: movie.original_title,
        releaseDate: movie.release_date,
        overview: movie.overview,
        posterUrl: tmdbImageUrl(movie.poster_path as string | null, "w342"),
      }))
      return new Response(JSON.stringify({ results }), { headers: responseHeaders })
    }

    const credits = tmdbData.credits ?? {}
    const crew = Array.isArray(credits.crew) ? credits.crew : []
    const byJob = (job: string) => crew.filter((person: Record<string, string>) => person.job === job).map((person: Record<string, string>) => person.name)
    const trailer = (tmdbData.videos?.results ?? []).find((video: Record<string, string>) => video.site === "YouTube" && video.type === "Trailer")
    const certification = (tmdbData.release_dates?.results ?? [])
      .flatMap((country: Record<string, unknown>) => Array.isArray(country.release_dates) ? country.release_dates : [])
      .find((release: Record<string, string>) => Boolean(release.certification))?.certification ?? null

    const movie = {
      tmdbId: tmdbData.id,
      imdbId: tmdbData.external_ids?.imdb_id ?? null,
      title: tmdbData.title ?? "",
      originalTitle: tmdbData.original_title ?? "",
      originalLanguage: tmdbData.original_language ?? "",
      overview: tmdbData.overview ?? "",
      tagline: tmdbData.tagline ?? "",
      releaseDate: tmdbData.release_date ?? "",
      year: tmdbData.release_date ? Number(String(tmdbData.release_date).slice(0, 4)) : null,
      runtime: tmdbData.runtime ?? null,
      rating: tmdbData.vote_average ? Number(tmdbData.vote_average.toFixed(1)) : null,
      voteCount: tmdbData.vote_count ?? null,
      genres: (tmdbData.genres ?? []).map((genre: Record<string, string>) => genre.name).join(", "),
      cast: (credits.cast ?? []).slice(0, 18).map((person: Record<string, string>) => person.character ? `${person.name} — ${person.character}` : person.name).join("\n"),
      directors: byJob("Director").join(", "),
      writers: [...byJob("Writer"), ...byJob("Screenplay"), ...byJob("Story")].filter((name: string, index: number, names: string[]) => names.indexOf(name) === index).join(", "),
      producers: byJob("Producer").join(", "),
      productionCompanies: (tmdbData.production_companies ?? []).map((company: Record<string, string>) => company.name).join(", "),
      productionCountries: (tmdbData.production_countries ?? []).map((country: Record<string, string>) => country.name).join(", "),
      spokenLanguages: (tmdbData.spoken_languages ?? []).map((language: Record<string, string>) => language.english_name ?? language.name).join(", "),
      budget: tmdbData.budget || null,
      revenue: tmdbData.revenue || null,
      certification,
      trailerUrl: trailer?.key ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
      posterUrl: tmdbImageUrl(tmdbData.poster_path, "w780"),
      backdropUrl: tmdbImageUrl(tmdbData.backdrop_path, "original"),
      tmdbUrl: `https://www.themoviedb.org/movie/${tmdbData.id}`,
      imdbUrl: tmdbData.external_ids?.imdb_id ? `https://www.imdb.com/title/${tmdbData.external_ids.imdb_id}/` : null,
    }

    return new Response(JSON.stringify({ movie }), { headers: responseHeaders })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: "სერვერის შეცდომა." }), { status: 500, headers: responseHeaders })
  }
})
