# How to add photos to the portfolio

**Drop your photos into the matching category folder** (`mixed-media/`, `digital/`,
`photography/`, `typography/`, `street/`, `sketchbook/`) — right here on
github.com (Add file → Upload files) or via `git push`.

That's the whole job. A GitHub Action picks them up automatically:
- bakes in the correct orientation
- makes the 1600px web version + 400px thumbnail in `assets/images/`
- adds them to the gallery
- reads the **Title** and **Description** you set in your editor and puts them
  on the back of the 3D art card (override anytime in `js/artMeta.js`)

Then it deletes the originals from here (your masters stay wherever you keep them).
Netlify deploys the site on its own.

Tips:
- Any image format works (JPG, PNG, WebP). The web versions are always JPEG.
- Files are numbered automatically: the next `sketchbook-*.jpg` becomes `sketchbook-27.jpg`, etc.
- Anything that isn't an image, or lands outside a category folder, gets skipped.
