// tiles.ts

export interface Point {
  x: number;
  y: number;
}

export interface Tile {
  region: string;
  polygon: Point[]; // Defines the shape of the tile (for rendering and hit detection)
  unitPosition?: Point; // Optional override for unit rendering
  labelPosition?: Point;
  type?: 'land' | 'sea' | 'coast';
  supplyCenter?: boolean;
}

// === Tile data definition ===
// These are simple examples using rectangular shapes.
// You can update polygons for more accurate or unique shapes.

export const tileMap: Record<string, Tile> = {
  nao: {
    region: 'nao',
    type: 'sea',
    polygon: [
      { x: 0, y: 0 },
      { x: 300, y: 0 },
      { x: 300, y: 25 },
      { x: 300, y: 50 },
      { x: 200, y: 50 },
      { x: 200, y: 25 },
      { x: 150, y: 25 },
      { x: 150, y: 100 },
      { x: 125, y: 100 },
      { x: 100, y: 100 },
      { x: 75, y: 100 },
      { x: 75, y: 275 },
      { x: 0, y: 275 },
    ],
    labelPosition: { x: 50, y: 75 },
  },

  iri: {
    region: 'iri',
    type: 'sea',
    polygon: [
      { x: 150, y: 100 },
      { x: 150, y: 150 },
      { x: 125, y: 150 },
      { x: 125, y: 275 },
      { x: 75, y: 275 },
      { x: 75, y: 100 },
    ],
  },

  nwg: {
    region: 'nwg',
    type: 'sea',
    polygon: [
      { x: 675, y: 175 },
      { x: 675, y: 0 },
      { x: 325, y: 0 },
      { x: 300, y: 0 },
      { x: 300, y: 50 },
      { x: 200, y: 50 },
      { x: 200, y: 75 },
      { x: 200, y: 100 },
      { x: 200, y: 125 },
      { x: 550, y: 125 },
      { x: 550, y: 175 },
    ],
    labelPosition: { x: 450, y: 100 },
  },

  mao: {
    region: 'mao',
    type: 'sea',
    polygon: [
      
      { x: 0, y: 275 },
      { x: 125, y: 275 },
      //{ x: 0, y: 725 },
      { x: 125, y: 475 },
      { x: 100, y: 475 },
      { x: 100, y: 525 },
      { x: 150, y: 525 },
      { x: 150, y: 675 },
      { x: 125, y: 675 },
      { x: 125, y: 725 },
      { x: 0, y: 725 },
    ],
    labelPosition: { x: 75, y: 450 },
  },

  ion: {
    region: 'ion',
    type: 'sea',
    polygon: [
      { x: 300, y: 725 },
      { x: 300, y: 675 },
      { x: 300, y: 675 },
      { x: 300, y: 600 },
      { x: 325, y: 600 },
      { x: 325, y: 625 },
      { x: 375, y: 625 },
      { x: 375, y: 600 },
      { x: 450, y: 600 },
      { x: 450, y: 575 },
      { x: 500, y: 575 },
      { x: 500, y: 650 },
      { x: 550, y: 650 },
      { x: 550, y: 725 },
    ],
  },

  eas: {
    region: 'eas',
    type: 'sea',
    polygon: [
      { x: 550, y: 725 },
      { x: 675, y: 725 },
      { x: 675, y: 625 },
      { x: 650, y: 600 },
      { x: 600, y: 600 },
      { x: 600, y: 650 },
      { x: 550, y: 650 },
    ],
    //labelPosition: { x: 625, y: 690 },
  },

  naf: {
    region: 'naf',
    type: 'land',
    polygon: [
      { x: 125, y: 675 },
      { x: 200, y: 675 },
      { x: 200, y: 725 },
      { x: 125, y: 725 },
    ]
  },

  tun: {
    region: 'tun',
    type: 'land',
    polygon: [
      { x: 200, y: 675 },
      { x: 300, y: 675 },
      { x: 300, y: 725 },
      { x: 200, y: 725 },
    ],
  },

  bar: {
    region: 'bar',
    type: 'sea',
    polygon: [
      { x: 600, y: 175 },
      { x: 675, y: 175 },
      { x: 675, y: 225 },
      { x: 600, y: 225 },
    ],
    //labelPosition: { x: 638, y: 205 },
  },
  cly: {
    region: 'cly',
    type: 'land',
    polygon: [
        {x: 150, y: 25},
        {x: 200, y: 25},
        {x: 200, y: 75},
        {x: 150, y: 75},
    ]
  },
  lvp: {
    region: 'lvp',
    type: 'land',
    polygon: [
        {x: 150, y: 75},
        {x: 175, y: 75},
        {x: 175, y: 175},
        {x: 150, y: 175},
    ]
  },
  edi: {
    region: 'edi',
    type: 'land',
    polygon: [
        {x: 175, y: 75},
        {x: 200, y: 75},
        {x: 200, y: 150},
        {x: 175, y: 150},
    ]
  },
  wal: {
    region: 'wal',
    type: 'land',
    polygon: [
        {x: 125, y: 150},
        {x: 150, y: 150},
        {x: 150, y: 250},
        {x: 125, y: 250},
    ],
  },
  lon: {
    region: 'lon',
    type: 'land',
    polygon: [
        {x: 150, y: 225},
        {x: 200, y: 225},
        {x: 200, y: 250},
        {x: 150, y: 250},
    ]
  },
  yor: {
    region: 'yor',
    type: 'land',
    polygon: [
        {x: 150, y: 175},
        {x: 175, y: 175},
        {x: 175, y: 150},
        {x: 200, y: 150},
        {x: 200, y: 225},
        {x: 150, y: 225},
    ],
  },
  eng: {
    region: 'eng',
    type: 'sea',
    polygon: [
        {x: 125, y: 250},
        {x: 175, y: 250},
        {x: 175, y: 275},
        {x: 250, y: 275},
        {x: 250, y: 300},
        {x: 175, y: 300},
        {x: 175, y: 325},
        {x: 125, y: 325},
    ],
  },
  nth: {
    region: 'nth',
    type: 'sea',
    polygon: [
        {x: 200, y: 125},
        {x: 575, y: 125},
        {x: 575, y: 175},
        {x: 525, y: 175},
        {x: 425, y: 175},
        {x: 425, y: 200},
        {x: 300, y: 200},
        {x: 300, y: 225},
        {x: 275, y: 225},
        {x: 275, y: 250},
        {x: 250, y: 250},
        {x: 250, y: 275},
        {x: 175, y: 275},
        {x: 175, y: 250},
        {x: 200, y: 250},
    ],
    labelPosition: { x: 300, y: 170},
  },
  ska: {
    region: 'ska',
    type: 'sea',
    polygon: [
        {x: 450, y: 150},
        {x: 550, y: 150},
        {x: 550, y: 175},
        {x: 450, y: 175},
    ],
    labelPosition: { x: 500, y: 165},
  },
  nwy: {
    region: 'nwy',
    type: 'land',
    polygon: [
        {x: 600, y: 175},
        {x: 600, y: 200},
        {x: 525, y: 200},
        {x: 525, y: 175},
    ]
  },
  swe: {
    region: 'swe',
    type: 'land',
    polygon: [
        {x: 475, y: 225},
        {x: 525, y: 225},
        {x: 525, y: 175},
        {x: 475, y: 175},
    ]
  },
  den: {
    region: 'den',
    type: 'land',
    polygon: [
        {x: 475, y: 225},
        {x: 475, y: 175},
        {x: 425, y: 175},
        {x: 425, y: 225},
        {x: 475, y: 225},
    ]
  },
  hel: {
    region: 'hel',
    type: 'sea',
    polygon: [
        {x: 425, y: 200},
        {x: 300, y: 200},
        {x: 300, y: 225},
        {x: 325, y: 225},
        {x: 325, y: 250},
        {x: 375, y: 250},
        {x: 375, y: 225},
        {x: 425, y: 225},
    ]
  },
  hol: {
    region: 'hol',
    type: 'land',
    polygon: [
        {x: 275, y: 225},
        {x: 325, y: 225},
        {x: 325, y: 250},
        {x: 350, y: 250},
        {x: 350, y: 275},
        {x: 275, y: 275},
    ],
  },
  kie: {
    region: 'kie',
    type: 'land',
    polygon: [
        {x: 350, y: 250},
        {x: 375, y: 250},
        {x: 375, y: 225},
        {x: 450, y: 225},
        {x: 450, y: 250},
        {x: 425, y: 250},
        {x: 425, y: 275},
        {x: 350, y: 275},
    ],
  },
  bel: {
    region: 'bel',
    type: 'land',
    polygon: [
        {x: 250, y: 250},
        {x: 275, y: 250},
        {x: 275, y: 275},
        {x: 300, y: 275},
        {x: 300, y: 300},
        {x: 275, y: 300},
        {x: 275, y: 325},
        {x: 250, y: 325},
    ]
  },
  pic: {
    region: 'pic',
    type: 'land',
    polygon: [
        {x: 250, y: 300},
        {x: 175, y: 300},
        {x: 175, y: 325},
        {x: 225, y: 325},
        {x: 225, y: 350},
        {x: 250, y: 350},
    ]
  },
  par: {
    region: 'par',
    type: 'land',
    polygon: [
        {x: 225, y: 325},
        {x: 225, y: 350},
        {x: 250, y: 350},
        {x: 250, y: 375},
        {x: 175, y: 375},
        {x: 175, y: 350},
        {x: 200, y: 350},
        {x: 200, y: 325},
    ]
  },
  bre: {
    region: 'bre',
    type: 'land',
    polygon: [
        {x: 125, y: 325},
        {x: 125, y: 375},
        {x: 175, y: 375},
        {x: 175, y: 350},
        {x: 200, y: 350},
        {x: 200, y: 325},
    ]
  },
  gas: {
    region: 'gas',
    type: 'land',
    polygon:[
      {x:125, y:375},
      {x:225, y:375},
      {x:225, y:400},
      {x:200, y:400},
      {x:200, y:425},
      {x:125, y:425},
    ],
  },
  mar: {
    region: 'mar',
    type: 'land',
    polygon: [
      {x:175, y:425},
      {x:200, y:425},
      {x:200, y:400},
      {x:250, y:400},
      {x:250, y:450},
      {x:175, y:450},
    ]
  },
  spa: {
    region: 'spa',
    type: 'land',
    polygon: [
      {x:125, y:425},
      {x:175, y:425},
      {x:175, y:525},
      {x:125, y:525},
      {x:125, y:475},
      {x:125, y:475},
    ]
  },
  por: {
    region: 'por',
    type: 'land',
    polygon: [
      {x:125, y:475},
      {x:100, y:475},
      {x:100, y:525},
      {x:125, y:525},
    ]
  },
  bur: {
    region: 'bur',
    type: 'land',
    polygon: [
      {x: 225, y: 375},
      {x: 250, y: 375},
      {x: 250, y: 325},
      {x: 275, y: 325},
      {x: 275, y: 300},
      {x: 300, y: 300},
      {x: 300, y: 350},
      {x: 325, y: 350},
      {x: 325, y: 375},
      {x: 275, y: 375},
      {x: 275, y: 400},
      {x: 225, y: 400},
    ]
  },
  ruh: {
    region: 'ruh',
    type: 'land',
    polygon: [
      {x: 300, y: 275},
      {x: 375, y: 275},
      {x: 375, y: 275},
      {x: 375, y: 325},
      {x: 325, y: 325},
      {x: 325, y: 350},
      {x: 300, y: 350},
    ]
  },
  mun: {
    region: 'mun',
    type: 'land',
    polygon: [
      {x: 325, y: 400},
      {x: 325, y: 325},
      {x: 375, y: 325},
      {x: 375, y: 275},
      {x: 400, y: 275},
      {x: 400, y: 400},
    ]
  },
  ber: {
    region: 'ber',
    type: 'land',
    polygon: [
      {x: 400, y: 325},
      {x: 400, y: 275},
      {x: 450, y: 275},
      {x: 450, y: 325},
    ]
  },
  pru: {
    region : 'pru',
    type: 'land',
    polygon: [
      {x: 450, y: 275},
      {x: 475, y: 275},
      {x: 475, y: 300},
      {x: 525, y: 300},
      {x: 525, y: 325},
      {x: 450, y: 325},
    ]
  },
  sil: {
    region: 'sil',
    type: 'land',
    polygon: [
      {x: 400, y: 325},
      {x: 475, y: 325},
      {x: 475, y: 375},
      {x: 400, y: 375},
    ]
  },
  boh: {
    region: 'boh',
    type: 'land',
    polygon: [
      {x:400, y:375},
      {x:475, y:375},
      {x:475, y:400},
      {x:450, y:400},
      {x:450, y:425},
      {x:400, y:425},
    ]
  },
  vie: {
    region: 'vie',
    type: 'land',
    polygon: [
      {x: 450, y: 400},
      {x: 475, y: 400},
      {x: 475, y: 450},
      {x: 450, y: 450},
      {x: 450, y: 475},
      {x: 400, y: 475},
      {x: 400, y: 450},
      {x: 425, y: 450},
      {x: 425, y: 425},
      {x: 450, y: 425},
    ]
  },
  war: {
    region: 'war',
    type: 'land',
    polygon: [
      {x:475, y: 325},
      {x:525, y: 325},
      {x:525, y: 350},
      {x:575, y: 350},
      {x:575, y: 350},
      {x:575, y: 400},
      {x:550, y: 400},
      {x:550, y: 375},
      {x:500, y: 375},
      {x:500, y: 350},
      {x:475, y: 350},
    ]
  },
  gal: {
    region: 'gal',
    type: 'land',
    polygon: [
      {x:475, y: 350},
      {x:500, y: 350},
      {x:500, y: 375},
      {x:550, y: 375},
      {x:550, y: 425},
      {x:475, y: 425},
    ]
  },
  bud: {
    region: 'bud',
    type: 'land',
    polygon: [
      {x:475, y: 425},
      {x:525, y: 425},
      {x:525, y: 450},
      {x:500, y: 450},
      {x:500, y: 475},
      {x:475, y: 475},
      {x:475, y: 500},
      {x:450, y: 500},
      {x:450, y: 450},
      {x:475, y: 450},
    ]
  },
  tri: {
    region: 'tri',
    type: 'land',
    polygon: [
      {x:450, y: 475},
      {x:375, y: 475},
      {x:375, y: 500},
      {x:425, y: 500},
      {x:425, y: 550},
      {x:450, y: 550},
      {x:450, y: 525},
      {x:475, y: 525},
      {x:475, y: 500},
      {x:450, y: 500},
    ]
  },
  tyr: {
    region: 'tyr',
    type: 'land',
    polygon: [
      {x:400, y: 400},
      {x:325, y: 400},
      {x:325, y: 475},
      {x:400, y: 475},
      {x:400, y: 450},
      {x:425, y: 450},
      {x:425, y: 425},
      {x:400, y: 425},
    ]
  },
  pie: {
    region: 'pie',
    type: 'land',
    polygon: [
      {x: 325, y:425},
      {x: 250, y:425},
      {x: 250, y:475},
      {x: 300, y:475},
      {x: 300, y:450},
      {x: 325, y:450},
    ]
  },
  tus: {
    region: 'tus',
    type: 'land',
    polygon: [
      {x: 275, y: 475},
      {x: 300, y: 475},
      {x: 300, y: 500},
      {x: 325, y: 500},
      {x: 325, y: 525},
      {x: 275, y: 525},
    ]
  },
  rom: {
    region: 'rom',
    type: 'land',
    polygon: [
      {x: 300, y: 525},
      {x: 325, y: 525},
      {x: 325, y: 550},
      {x: 350, y: 550},
      {x: 350, y: 575},
      {x: 325, y: 575},
      {x: 325, y: 600},
      {x: 300, y: 600},
    ]
  },
  nap: {
    region: 'nap',
    type: 'land',
    polygon: [
      {x: 325, y: 575},
      {x: 350, y: 575},
      {x: 350, y: 625},
      {x: 325, y: 625},
    ]
  },
  apu: {
    region: 'apu',
    type: 'land',
    polygon: [
      {x: 350, y: 550},
      {x: 375, y: 550},
      {x: 375, y: 625},
      {x: 350, y: 625},
    ]
  },
  ven: {
    region: 'ven',
    type: 'land',
    polygon: [
      {x: 300, y:450},
      {x: 325, y:450},
      {x: 325, y:475},
      {x: 375, y:475},
      {x: 375, y:550},
      {x: 325, y:550},
      {x: 325, y:500},
      {x: 300, y:500},
    ]
  },
  alb: {
    region: 'alb',
    type: 'land',
    polygon: [
      {x: 450, y:525},
      {x: 475, y:525},
      {x: 475, y:550},
      {x: 500, y:550},
      {x: 500, y:575},
      {x: 450, y:575},
    ]
  },
  ser: {
    region: 'ser',
    type: 'land',
    polygon: [
      {x: 475, y:475},
      {x: 500, y:475},
      {x: 500, y:450},
      {x: 525, y:450},
      {x: 525, y:525},
      {x: 500, y:525},
      {x: 500, y:550},
      {x: 475, y:550},
    ]
  },
  gre: {
    region: 'gre',
    type: 'land',
    polygon: [
      {x: 500, y:525},
      {x: 525, y:525},
      {x: 525, y:600},
      {x: 500, y:600},
    ]
  },
  bul: {
    region: 'bul',
    type: 'land',
    polygon: [
      {x: 525, y:500},
      {x: 525, y:575},
      {x: 550, y:575},
      {x: 550, y:525},
      {x: 575, y:525},
      {x: 575, y:500},
    ]
  },
  rum: {
    region: 'rum',
    type: 'land',
    polygon: [
      {x: 525, y:425},
      {x: 550, y:425},
      {x: 550, y:450},
      {x: 625, y:450},
      {x: 625, y:500},
      {x: 525, y:500},
    ]
  },
  ukr: {
    region: 'ukr',
    type: 'land',
    polygon: [
      {x: 550, y:400},
      {x: 575, y:400},
      {x: 575, y:425},
      {x: 625, y:425},
      {x: 625, y:450},
      {x: 550, y:450},
    ]
  },
  lvn: {
    region: "lvn",
    type: 'land',
    polygon: [
      {x: 525, y:300},
      {x: 575, y:300},
      {x: 575, y:350},
      {x: 525, y:350},
    ]
  },
  mos: {
    region: 'mos',
    type: 'land',
    polygon: [
      {x: 575, y:325},
      {x: 675, y:325},
      {x: 675, y:425},
      {x: 575, y:425},
    ]
  },
  stp: {
    region: 'stp',
    type: 'land',
    polygon: [
      {x: 575, y:325},
      {x: 675, y:325},
      {x: 675, y:225},
      {x: 600, y:225},
      {x: 600, y:200},
      {x: 575, y:200},
    ]
  },
  fin: {
    region: 'fin',
    type: 'land',
    polygon: [
      {x: 575, y:200},
      {x: 525, y:200},
      {x: 525, y:225},
      {x: 550, y:225},
      {x: 550, y:250},
      {x: 575, y:250},
    ]
  },
  con: {
    region: 'con',
    type: 'land',
    polygon: [
      {x: 550, y:550},
      {x: 600, y:550},
      {x: 600, y:575},
      {x: 575, y:575},
      {x: 575, y:600},
      {x: 550, y:600},
    ]
  },
  smy: {
    region: 'smy',
    type: 'land',
    polygon: [
      {x: 575, y:575},
      {x: 625, y:575},
      {x: 625, y:550},
      {x: 650, y:550},
      {x: 650, y:600},
      {x: 575, y:600},
    ]
  },
  ank: {
    region: 'ank',
    type: 'land',
    polygon: [
      {x: 600, y:575},
      {x: 600, y:525},
      {x: 650, y:525},
      {x: 650, y:550},
      {x: 625, y:550},
      {x: 625, y:575},
    ]
  },
  syr: {
    region: 'syr',
    type: 'land',
    polygon: [
      {x: 650, y:575},
      {x: 675, y:575},
      {x: 675, y:625},
      {x: 650, y:625},
    ]
  },
  arm: {
    region: 'arm',
    type: 'land',
    polygon: [
      {x: 650, y:575},
      {x: 675, y:575},
      {x: 675, y:450},
      {x: 650, y:450},
    ]
  },
  sev: {
    region: 'sev',
    type: 'land',
    polygon: [
      {x: 650, y:500},
      {x: 650, y:450},
      {x: 675, y:450},
      {x: 675, y:425},
      {x: 625, y:425},
      {x: 625, y:500},
    ]
  },
  bla: {
    region: 'bla',
    type: 'sea',
    polygon: [
      {x: 575, y:500},
      {x: 575, y:525},
      {x: 550, y:525},
      {x: 550, y:550},
      {x: 600, y:550},
      {x: 600, y:525},
      {x: 650, y:525},
      {x: 650, y:500},
    ]
  },
  bot: {
    region: 'bot',
    type: 'sea',
    polygon: [
      {x: 575, y:250},
      {x: 550, y:250},
      {x: 550, y:225},
      {x: 500, y:225},
      {x: 500, y:250},
      {x: 500, y:275},
      {x: 550, y:275},
      {x: 550, y:300},
      {x: 575, y:300},
    ]
  },
  bal: {
    region: 'bal',
    type: 'sea',
    polygon: [
      {x: 500, y:225},
      {x: 450, y:225},
      {x: 450, y:250},
      {x: 425, y:250},
      {x: 425, y:275},
      {x: 475, y:275},
      {x: 475, y:300},
      {x: 550, y:300},
      {x: 550, y:275},
      {x: 500, y:275},
    ]
  },
  adr: {
    region: 'adr',
    type: 'sea',
    polygon: [
      {x: 375, y:500},
      {x: 425, y:500},
      {x: 425, y:550},
      {x: 450, y:550},
      {x: 450, y:600},
      {x: 375, y:600},
    ]
  },
  aeg: {
    region: 'aeg',
    type: 'sea',
    polygon: [
      {x: 500, y:600},
      {x: 525, y:600},
      {x: 525, y:575},
      {x: 550, y:575},
      {x: 550, y:600},
      {x: 600, y:600},
      {x: 600, y:650},
      {x: 500, y:650},
    ]
  },
  lyo: {
    region: 'lyo',
    type: 'sea',
    polygon: [
      {x: 175, y:450},
      {x: 250, y:450},
      {x: 250, y:475},
      {x: 275, y:475},
      {x: 275, y:525},
      {x: 175, y:525},
    ]
  },
  wes: {
    region: 'wes',
    type: 'sea',
    polygon: [
      {x: 150, y:525},
      {x: 225, y:525},
      {x: 225, y:675},
      {x: 150, y:675},
    ]
  },
  tys: {
    region: 'tys',
    type: 'sea',
    polygon: [
      {x: 225, y:525},
      {x: 300, y:525},
      {x: 300, y:675},
      {x: 225, y:675},
    ]
  }
};


// === Convenience exports ===

export const tiles: Tile[] = Object.values(tileMap);

const SCALE_X = 5.2;
const SCALE_Y = 3.02;

const TILE_UNIT = 25;

// Scale a single point
function scalePoint(p: Point): Point {
  return { x: p.x * SCALE_X, y: p.y * SCALE_Y };
}

// Scale all tile coordinates
Object.values(tileMap).forEach(tile => {
  tile.polygon = tile.polygon.map(scalePoint);
  if (tile.unitPosition) tile.unitPosition = scalePoint(tile.unitPosition);
  if (tile.labelPosition) tile.labelPosition = scalePoint(tile.labelPosition);
});

function getPolygonCentroid(pts: Point[]): Point {
  let area = 0;
  let cx = 0;
  let cy = 0;

  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const a = p1.x * p2.y - p2.x * p1.y;
    area += a;
    cx += (p1.x + p2.x) * a;
    cy += (p1.y + p2.y) * a;
  }

  area *= 0.5;
  const factor = 1 / (6 * area);
  return { x: cx * factor, y: cy * factor };
}


export function getUnitPosition(region: string): Point | null {
  const tile = tileMap[region.toLowerCase()];
  if (!tile) return null;

  if (tile.unitPosition) return tile.unitPosition;

  return getPolygonCentroid(tile.polygon);
}

export function getTileCenter(tile: Tile): Point {
  const pts = tile.polygon;
  const sum = pts.reduce(
    (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
    { x: 0, y: 0 }
  );
  return {
    x: sum.x / pts.length,
    y: sum.y / pts.length,
  };
}

export function getTileBottomLeft(tile: Tile): Point {
  const pts = tile.polygon;
  let bottomLeft: Point | null = null;

  for (const p of pts) {
    if (
      bottomLeft === null ||
      p.y > bottomLeft.y || // lower on screen
      (p.y === bottomLeft.y && p.x < bottomLeft.x) // further left if tied
    ) {
      bottomLeft = p;
    }
  }

  return bottomLeft!;
}

export function getTileTopRight(tile: Tile): Point {
  const pts = tile.polygon;
  let topRight: Point | null = null;

  for (const p of pts) {
    if (
      topRight === null ||
      p.y < topRight.y || // higher on screen
      (p.y === topRight.y && p.x > topRight.x) // further right if tied
    ) {
      topRight = p;
    }
  }

  return topRight!;
}

export function getTileTextAnchor(tile: Tile): Point {
  const bottomLeft = getTileBottomLeft(tile);
  return {
    x: bottomLeft.x + TILE_UNIT * SCALE_X/SCALE_Y,
    y: bottomLeft.y - TILE_UNIT * SCALE_Y/SCALE_X,
  };
}