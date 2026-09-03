Vehicle video fallback
======================

Vehicle images remain the default. A vehicle video is used only when that vehicle has no image configured.

Add MP4 files to this folder using the exact vehicle ID filename:

  byd-tang-l.mp4
  geely-galaxy-e5.mp4
  byd-song-plus.mp4
  toyota-bz3x.mp4
  geely-starwish.mp4

Folder: public/videos/

The video is HTML5, muted, autoplaying, looping, and plays inline on mobile.
To make a vehicle use its video, leave its image field empty in src/data/vehicles.ts.
