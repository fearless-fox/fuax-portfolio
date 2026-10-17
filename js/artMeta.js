// Per-piece metadata for the 3D art card backs.
//
// Key = the exact image filename as it appears in the gallery
// (e.g. 'sketchbook-17.jpg'). Any field can be omitted — the card falls
// back to the auto title (from the filename) and the gallery category.
//
// Fields:
//   title  - overrides the auto-generated title
//   medium - e.g. 'Ink on paper', 'Spray + acrylic on canvas'
//   year   - e.g. '2024'
//   story  - short text about the piece (keep it tight, it shares the card back)
//   status - e.g. 'Available', 'Sold', 'NFS'
//
// New pieces work fine with no entry at all — add one whenever you want
// the back of the card to say more.

export const ART_META = {

  // 'sketchbook-17.jpg': {
  //   title: 'Teeth First',
  //   medium: 'Ink on paper',
  //   year: '2024',
  //   story: 'Drew this at 3am when the teeth wouldn\'t leave me alone.',
  //   status: 'Available',
  // },

  // 'photography-03.jpg': {
  //   medium: 'Digital photograph',
  //   year: '2023',
  //   status: 'NFS',
  // },

};
