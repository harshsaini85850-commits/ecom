
import Navbar from "@/components/Navbar";
import "./Categories.css";

const categories = [
  {
    name: "Shoes",
    description: "Find the perfect pair for every occasion.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=85",
    count: "Explore footwear",
  },
  {
    name: "Accessories",
    description: "Complete your look with stylish accessories.",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=85",
    count: "Explore accessories",
  },
  {
    name: "Electronics",
    description: "Discover technology for everyday life.",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85",
    count: "Explore electronics",
  },
];

export default function CategoriesPage() {
  return (
    <>
      <Navbar />

      <main className="categories-page">
        <section className="categories-heading">
          <span>SHOP BY CATEGORY</span>
          <h1>Find What You Love</h1>
          <p>
            Explore our collections and discover products
            that match your style.
          </p>
        </section>

        <section className="categories-grid">
          {categories.map((category) => (
            <article className="category-card" key={category.name}>
              <div className="category-image">
                <img src={category.image} alt={category.name} />
              </div>

              <div className="category-content">
                <span>{category.count}</span>
                <h2>{category.name}</h2>
                <p>{category.description}</p>

                <a href="/products" className="category-button">
                  Explore Collection →
                </a>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
