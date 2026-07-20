export interface MenuItem {
  name: string
  description: string
  price: string
}

export interface MenuCategory {
  category: string
  items: MenuItem[]
}

// Datos de ejemplo — sustituir por la carta real de Asador Gonsastrez.
export const menu: MenuCategory[] = [
  {
    category: 'Entrantes',
    items: [
      {
        name: 'Jamón ibérico de bellota',
        description: 'Cortado a cuchillo',
        price: '18€',
      },
      {
        name: 'Croquetas de jamón',
        description: 'Seis unidades, receta de la casa',
        price: '9€',
      },
      {
        name: 'Pimientos de Padrón',
        description: 'Con sal en escamas',
        price: '7€',
      },
    ],
  },
  {
    category: 'Carnes a la brasa',
    items: [
      {
        name: 'Chuletón de vaca madurada',
        description: 'Para compartir, a la brasa de carbón',
        price: '38€',
      },
      {
        name: 'Solomillo ibérico',
        description: 'Con guarnición de patata panadera',
        price: '22€',
      },
      {
        name: 'Cordero lechal asado',
        description: 'Al horno de leña, media ración',
        price: '19€',
      },
    ],
  },
  {
    category: 'Postres',
    items: [
      {
        name: 'Torrija caramelizada',
        description: 'Con helado de vainilla',
        price: '7€',
      },
      {
        name: 'Tarta de queso',
        description: 'Casera, horneada al día',
        price: '6€',
      },
    ],
  },
]
