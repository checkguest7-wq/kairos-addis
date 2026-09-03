# JPG / PNG image filename fix

The app previously referenced image files with a fixed extension such as:

`/images/car_byd_song_1788207081795.jpg`

If the real file was renamed to:

`car_byd_song_1788207081795.png`

the browser requested the old `.jpg` URL and showed a broken image.

## Fix

The Express server now automatically checks JPG, JPEG, and PNG variants for `/images/...` requests. Therefore, if the code requests `.jpg` but only `.png` exists, the PNG is served automatically.

### Important

- The PNG must be a real PNG image, not a JPG file renamed to `.png`.
- If both `.jpg` and `.png` exist, the requested extension is preferred.
- Admin image uploads already validate JPG/JPEG/PNG and can be selected for vehicle images.
- Restart the development server after installing this version.

Run:

```cmd
npm install
npm run dev
```
