# Avenir Arabic Webfonts

These font files are now used directly by `@font-face` in `../styles.css`:

Included OTF files:
- AvenirArabic-Light.otf (weight 300)
- AvenirArabic-Medium.otf (weight 500)
- AvenirArabic-Heavy.otf (weight 800)
- AvenirArabic-Black 2.otf (weight 900)

Optional (performance): Converting these to `.woff2` will reduce size and speed up loading. If you convert them, update the `src:` URLs in `styles.css` and (optionally) the preload tags in `index.html` accordingly.

Preload (optional): Uncomment the `<link rel="preload" ...>` tags in `index.html` to preload the OTFs.
