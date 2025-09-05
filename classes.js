class Product {
  constructor(name, price, discount, image) {
    this.name = name;
    this.price = price;
    this.discount = discount || 0;
    this.image = image || null;
  }
}

module.exports = {
  Product,
};
