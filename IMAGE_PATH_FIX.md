# Kairos Addis image path fix

Local website images were moved from `src/assets/images` to `public/images`.

References such as:
`/src/assets/images/example.jpg`

were changed to:
`/images/example.jpg`

This makes the images available as static public assets in the Vercel production build.
