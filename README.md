# thameiu's cards

"cards", yeah that's the name of the project, is a web digital binder which displays my collection of random cards i've accumulated over the years.

The idea is simple: scan both sides of a card, crop it properly, and drop it into the project so it can be viewed like a real object instead of a flat gallery image.

## what it does

- shows the collection in a regular scroll grid
- shows the same collection in an infinite draggable grid
- opens each card in a modal with an interactive 3D viewer

## how cards are added

cards are defined in [`src/CardList.tsx`](./src/CardList.tsx).

each card has:

- `id`: internal identifier, not displayed
- `label`: text shown on hover
- `description`: text shown in the modal

images are resolved automatically from the `id`:

- recto (front): `public/assets/cards/<id>_r.png`
- verso (back): `public/assets/cards/<id>_v.png`

if the back image does not exist, the viewer simply renders a white back face.
if the front image does not exist,
... well that would be stupid. if there's no image, then there's no card.

## current asset format

the current setup assumes:

- the front image is the source of truth for the final card shape
- transparent zones in the front image define the actual silhouette of the 3D model
- the back image is scaled to match the front dimensions without stretching
- if the back image overflows a bit after scaling, that is intentional and preferred over blank margins

## project structure

main files:

- [`src/App.tsx`](./src/App.tsx): top-level app state and view switching
- [`src/CardList.tsx`](./src/CardList.tsx): card definitions
- [`src/components/ImageCardThumb.tsx`](./src/components/ImageCardThumb.tsx): grid thumbnails + hover tooltip
- [`src/components/CardModal.tsx`](./src/components/CardModal.tsx): modal shell and transitions
- [`src/components/Viewer3D.tsx`](./src/components/Viewer3D.tsx): texture prep, camera fit, and 3D viewer setup
- [`src/lib/threeCard.ts`](./src/lib/threeCard.ts): actual 3D card model construction
- [`src/styles.css`](./src/styles.css): all layout and visual styling

## development

this project uses React + Vite + Three.js.

available scripts:

```bash
npm run dev
npm run build
npm run preview
```

## notes

this is not meant to be a generic card CMS or a perfectly automated archive workflow.
the slow part is still the human one: scanning, cleaning, cropping, naming, etc.

once the images are ready, the app is intentionally lightweight:
add an entry to `CardList.tsx`, put the matching `_r` / `_v` files in `public/assets/cards`, and the binder picks them up.
