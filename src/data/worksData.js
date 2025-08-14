// src/data/worksData.js
export const worksData = {
  ceramics: {
    title: "CERAMICS",
    images: [
      "/assets/works/ceramics/01.png",
      "/assets/works/ceramics/02.png",
      "/assets/works/ceramics/03.png",
      "/assets/works/ceramics/04.png",
      "/assets/works/ceramics/05.png",
      "/assets/works/ceramics/06.jpeg",
      "/assets/works/ceramics/07.jpg",
      "/assets/works/ceramics/08.jpg",
    ],
  },
  drawing: {
    title: "DRAWINGS",
    images: [
      "/assets/works/drawing/01.png",
      "/assets/works/drawing/02.png",
      "/assets/works/drawing/03.png",
      "/assets/works/drawing/04.png",
      "/assets/works/drawing/05.png",
      "/assets/works/drawing/06.png",
      "/assets/works/drawing/07.png",
      "/assets/works/drawing/08.png",
      "/assets/works/drawing/09.jpg",
    ],
  },
  designs: {
    title: "DESIGNS",
    images: [
      "/assets/works/designs/01.png",
      "/assets/works/designs/02.png",
      "/assets/works/designs/03.jpg",
      "/assets/works/designs/04.jpg",
      "/assets/works/designs/05.jpg",
    ],
  },
};

// small helpers
export const validSlugs = Object.keys(worksData);
export const getSeries = (slug) => worksData[slug?.toLowerCase()];
