export interface FocalPoint {
  x: number
  y: number
}

export interface RecommendedDish {
  nombre: string
  tag?: string
  descripcion?: string
  imagen: string
  focalPoint?: FocalPoint | null
}

export const platosRecomendados: RecommendedDish[] = [
  {
    nombre: 'Chuletón de vaca madurado',
    tag: 'Brasa',
    descripcion: 'Madurado varias semanas en cámara, con el punto justo de brasa y mucho sabor.',
    imagen: '/images/menu/chuleton-madurado.webp',
    focalPoint: { x: 50, y: 58 },
  },
  {
    nombre: 'Costillas barbacoa',
    tag: 'Brasa',
    descripcion: 'Costilla cocinada a fuego lento y glaseada con nuestra salsa barbacoa casera.',
    imagen: '/images/menu/costillas-barbacoa.webp',
    focalPoint: { x: 50, y: 42 },
  },
  {
    nombre: 'Croquetas de rabo de toro',
    tag: 'Para compartir',
    descripcion: 'Cremosas por dentro y crujientes por fuera, con el sabor intenso del rabo de toro estofado.',
    imagen: '/images/menu/croquetas-rabo-de-toro.webp',
    focalPoint: { x: 42, y: 45 },
  },
  {
    nombre: 'Hamburguesa de angus',
    tag: 'Brasa',
    descripcion: 'Carne de angus a la brasa, queso fundido y pan brioche tostado.',
    imagen: '/images/menu/hamburguesa-angus.webp',
    focalPoint: null,
  },
  {
    nombre: 'Tarta de queso de la sierra',
    tag: 'Postre',
    descripcion: 'Horneada al estilo tradicional, con un corazón cremoso y un toque de sal en superficie.',
    imagen: '/images/menu/tarta-de-queso.webp',
    focalPoint: null,
  },
]
