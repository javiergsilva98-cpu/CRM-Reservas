import { menu } from '../data/menu'
import './MenuSection.css'

export function MenuSection() {
  return (
    <section className="menu-section">
      <p className="menu-eyebrow">Nuestra carta</p>
      <h2>Lo que te espera dentro</h2>

      <div className="menu-categories">
        {menu.map((category) => (
          <div className="menu-category" key={category.category}>
            <h3>{category.category}</h3>
            <ul>
              {category.items.map((item) => (
                <li key={item.name}>
                  <div className="menu-item-line">
                    <span className="menu-item-name">{item.name}</span>
                    <span className="menu-item-price">{item.price}</span>
                  </div>
                  <p className="menu-item-description">{item.description}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
