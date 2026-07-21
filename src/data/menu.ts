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
    category: 'Para picar',
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
      {
        name: 'Morcilla de Burgos',
        description: 'A la brasa, con arroz',
        price: '8€',
      },
      {
        name: 'Chorizo a la brasa',
        description: 'Con pan de pueblo',
        price: '8€',
      },
      {
        name: 'Queso curado de oveja',
        description: 'Con membrillo casero',
        price: '11€',
      },
      {
        name: 'Ensaladilla rusa',
        description: 'Receta tradicional',
        price: '8€',
      },
    ],
  },
  {
    category: 'Verduras y huevos',
    items: [
      {
        name: 'Espárragos a la brasa',
        description: 'Con aceite de oliva virgen extra',
        price: '9€',
      },
      {
        name: 'Pimientos asados',
        description: 'Con ventresca de atún',
        price: '10€',
      },
      {
        name: 'Judías verdes con jamón',
        description: 'Salteadas',
        price: '9€',
      },
      {
        name: 'Huevos rotos con jamón',
        description: 'Con patatas fritas caseras',
        price: '12€',
      },
      {
        name: 'Ensalada de la casa',
        description: 'Tomate, cebolla y ventresca',
        price: '9€',
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
        name: 'Entrecot de vaca',
        description: 'A la piedra',
        price: '24€',
      },
      {
        name: 'Solomillo ibérico',
        description: 'Con guarnición de patata panadera',
        price: '22€',
      },
      {
        name: 'Secreto ibérico',
        description: 'A la brasa de carbón',
        price: '17€',
      },
      {
        name: 'Presa ibérica',
        description: 'Con pimientos de temporada',
        price: '19€',
      },
      {
        name: 'Cordero lechal asado',
        description: 'Al horno de leña, media ración',
        price: '19€',
      },
      {
        name: 'Cochinillo asado',
        description: 'Al horno de leña, media ración',
        price: '21€',
      },
      {
        name: 'Costillar de cerdo ibérico',
        description: 'A baja temperatura y brasa final',
        price: '16€',
      },
    ],
  },
  {
    category: 'Pescados a la brasa',
    items: [
      {
        name: 'Merluza a la brasa',
        description: 'Con pimientos y patata panadera',
        price: '19€',
      },
      {
        name: 'Bacalao a la brasa',
        description: 'Con pisto de la huerta',
        price: '18€',
      },
      {
        name: 'Lubina a la brasa',
        description: 'Entera, para compartir',
        price: '24€',
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
      {
        name: 'Arroz con leche',
        description: 'Con canela',
        price: '5€',
      },
      {
        name: 'Flan de huevo casero',
        description: 'Con nata',
        price: '5€',
      },
      {
        name: 'Helados artesanos',
        description: 'Vainilla, chocolate o turrón',
        price: '5€',
      },
    ],
  },
]
