import SequelizeMock from "sequelize-mock";

const dbMock = new SequelizeMock();

const ProductMock = dbMock.define("Product", {
  id: 1,
  name: "Test Product",
  price: 9.99,
  description: "This is a sample product description.",
  duration: "15 days",
  category: "Test Category",
  stock_quantity: 100,
  category_id: 50,
  brand_id: 20,
  image_url: "https://tse1.mm.bing.net/th/id/OIP.CaLQPAQIokoCLu9WrzWeOgHaE7?rs=1&pid=ImgDetMain&o=7&rm=3",
  status: "active",
});

describe("Product Model", () => {
  it("should have the correct model name", async () => {
    const product = await ProductMock.create({
      name: "Sample Product",
      description: "Sample description",
      price: 19.99,
      duration: "20 days",
      category: "Sample Category",
      stock_quantity: 200,
      category_id: 10,
      brand_id: 5,
      image_url: "https://tse1.mm.bing.net/th/id/OIP.CaLQPAQIokoCLu9WrzWeOgHaE7?rs=1&pid=ImgDetMain&o=7&rm=3",
      status: "active",
    });
    expect(product.name).toBe("Sample Product");
    expect(product.price).toBe(19.99);
    expect(product.description).toBe("Sample description");
    expect(product.duration).toBe("20 days");
    expect(product.category).toBe("Sample Category");
    expect(product.stock_quantity).toBe(200);
    expect(product.category_id).toBe(10);
    expect(product.brand_id).toBe(5);
    expect(product.image_url).toBe("https://tse1.mm.bing.net/th/id/OIP.CaLQPAQIokoCLu9WrzWeOgHaE7?rs=1&pid=ImgDetMain&o=7&rm=3");
    expect(product.status).toBe("active");
  });

  it("should update product details correctly", async () => {
    const product = await ProductMock.create({
      name: "Old Name",
      price: 10,
    });
    product.name = "New Name";
    product.price = 20;
    await product.save();

    expect(product.name).toBe("New Name");
    expect(product.price).toBe(20);
  });
});
