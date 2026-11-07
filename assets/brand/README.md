# Linie brand assets

Approved identity artwork for Linie. Every file here is a byte-for-byte copy of an
accepted export. Do not regenerate, retouch, recolor, crop or re-encode these pixels.
If a new size or a new variant is needed, derive it from the source study listed below
and record its SHA-256 here.

## Files

| Path                            | Size   | Role                                                      |
| ------------------------------- | ------ | --------------------------------------------------------- |
| `logo.png`                      | 2048px | Repository logo, used by the README headers.              |
| `assets/brand/icon.png`         | 2048px | Mark on the drafting-paper background, catalogue artwork. |
| `assets/brand/icon-rounded.png` | 2048px | Mark on the rounded tile background, catalogue artwork.   |
| `public/brand-mark.png`         | 128px  | Transparent mark for the in-app header and sidebar.       |
| `public/brand-mark-rounded.png` | 112px  | Rounded tile mark for tiles and social surfaces.          |
| `public/favicon-32.png`         | 32px   | Transparent favicon.                                      |
| `public/apple-touch-icon.png`   | 180px  | Rounded tile apple touch icon.                            |

## SHA-256

```json
{
  "logo.png": "c6c3b34616bf9ef4fa8969e56c275fe1122adc1dbefbe0a2baefcf09f01611a4",
  "assets/brand/icon.png": "0f251ef727f9088ad9443aafb59eb8e2aeca9de4f3427ec46700713de8ffe362",
  "assets/brand/icon-rounded.png": "b3adcd815d4baf7bf9b84e1687a0f8f062d3184dae72faccbef5cf7b5077586e",
  "public/brand-mark.png": "8021ddc26c6d240f8ce59432d329af2176c4fefb529c054948256c9e71d5f0b3",
  "public/brand-mark-rounded.png": "615df1c08309e93a5f0288f83652da77fe7f55ad44be0ce1da792c26ba24bf94",
  "public/favicon-32.png": "f2baf5a790cb199f42b17bef125bdbed61596ee2a1820acb77a0dd97f2ce8be1",
  "public/apple-touch-icon.png": "cdcc3d1b183551183f80971d8ced646f1a08326fd3ce844e725bd93cdb523dd6"
}
```

## Source study

- Study: `artwork/logo-family/linie/2026-11-07-01/finishing/01`, kept in the Hexly family
  repository at `hexly.ai/artwork/logo-family/linie/2026-11-07-01/finishing/01`.
- Pass: `01`, finished with `artwork/logo-family/tools/finish_study.mjs`, tool SHA-256
  `3e68fac6f8c8f55721d15b50ca5b6eddb6ab1176f121ca341333699c7056ab88` is recorded in the
  study manifest together with the raw input SHA-256
  `c3dbf95889f3858f0e3d5d836bf0270c536112bdf20b54c555d8d9ebf297ea62`.
- Subject: one satin teal-enamel drafting set square with a triangular opening and a
  restrained brushed-brass edge. The raw generation is the 2048 x 2048 white-matte PNG
  `raw/generated.png` of that study.

## Provenance of each copy

```json
{
  "sourceStudy": "artwork/logo-family/linie/2026-11-07-01/finishing/01",
  "exports": "artwork/logo-family/linie/2026-11-07-01/finishing/01/exports",
  "files": [
    {
      "path": "logo.png",
      "derivedFrom": "linie-transparent-2048.png",
      "relationship": "exact-copy"
    },
    {
      "path": "assets/brand/icon.png",
      "derivedFrom": "linie-icon-2048.png",
      "relationship": "exact-copy"
    },
    {
      "path": "assets/brand/icon-rounded.png",
      "derivedFrom": "linie-rounded-2048.png",
      "relationship": "exact-copy"
    },
    {
      "path": "public/brand-mark.png",
      "derivedFrom": "linie-transparent-128.png",
      "relationship": "exact-copy"
    },
    {
      "path": "public/brand-mark-rounded.png",
      "derivedFrom": "linie-rounded-128.png",
      "relationship": "downscaled-derivative"
    },
    {
      "path": "public/favicon-32.png",
      "derivedFrom": "linie-transparent-32.png",
      "relationship": "exact-copy"
    },
    {
      "path": "public/apple-touch-icon.png",
      "derivedFrom": "linie-rounded-256.png",
      "relationship": "downscaled-derivative"
    }
  ]
}
```

## Usage rules

- The in-app product mark is the transparent family. `public/brand-mark.png` is used at
  48px in the atlas header and at 25px in the sidebar. The earlier Lucide cube marks are
  gone.
- The mark carries its own transparent background. Do not add a tile, a glow, a drop
  shadow, a border radius or any other mask around it in CSS.
- The mark is decorative next to the wordmark. Give it an empty `alt` and
  `aria-hidden="true"`.
- The rounded and icon families are tile artwork for surfaces that need their own
  background, such as the favicon set and social cards. They are not the in-app mark.
- The study owns the artwork. Any new derivative belongs to this manifest with its own
  SHA-256 and source export.
