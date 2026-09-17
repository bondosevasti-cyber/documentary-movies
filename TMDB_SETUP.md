# TMDb ინტეგრაციის ჩართვა

## 1. TMDb API token-ის მიღება

1. გახსენით https://www.themoviedb.org/signup და შექმენით ანგარიში.
2. ელფოსტა დაადასტურეთ, შემდეგ შედით **Settings → API** გვერდზე.
3. აირჩიეთ **Developer** და შეავსეთ მოთხოვნილი ფორმა.
4. დააკოპირეთ **API Read Access Token**. ეს გრძელი token-ია და არა მოკლე `API Key (v3 auth)`.

## 2. Token-ის უსაფრთხოდ დამატება Supabase-ში

ტერმინალში, პროექტის საქაღალდეში, გაუშვით:

```bash
supabase login
supabase secrets set TMDB_ACCESS_TOKEN="აქ_ჩასვით_TMDb_API_Read_Access_Token"
```

## 3. მონაცემთა ველებისა და ფუნქციის გამოქვეყნება

```bash
supabase db push
supabase functions deploy tmdb-movie-lookup
```

ამის შემდეგ გახსენით `admin.html` და ჩასვით IMDb ან TMDb-ის კონკრეტული ფილმის ბმული „IMDb / TMDb ბმულით ავტომატური შევსება“ ველში. ფორმა ავტომატურად შეივსება. თუ ბმული არ გაქვთ, ფილმის სახელით მოძებნაც შეგიძლიათ და სიიდან სწორ შედეგს აირჩევთ.

Token არასოდეს ჩასვათ `admin.html`-ში ან `supabase-config.js`-ში: ის მხოლოდ Supabase secret-ად უნდა დარჩეს.
