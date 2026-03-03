const categories = [
  "Food & Drink",
  "Groceries",
  "Transportation",
  "Rent",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Health",
  "Travel",
  "Salary",
  "Freelance",
  "Investments",
];

const descriptions = {
  "Food & Drink": ["Starbucks", "Chipotle", "McDonald's", "Cafe Nero"],
  Groceries: ["Trader Joe's", "Whole Foods", "Ralphs", "Target Grocery"],
  Transportation: ["Uber", "Lyft", "Metro Pass", "Gas Station"],
  Rent: ["Monthly Apartment Rent"],
  Utilities: ["Electric Bill", "Water Bill", "Internet Bill"],
  Entertainment: ["Netflix", "Spotify", "Movie Theater"],
  Shopping: ["Amazon", "Nike", "Apple Store"],
  Health: ["CVS Pharmacy", "Gym Membership", "Doctor Visit"],
  Travel: ["Delta Airlines", "Airbnb", "Hotel Booking"],
  Salary: ["Company Payroll"],
  Freelance: ["Client Payment"],
  Investments: ["Dividend Payout"],
};

const randomDate = () => {
  const start = new Date(2026, 0, 1);
  const end = new Date(2026, 11, 31);
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
  return date.toISOString().split("T")[0];
};

const randomAmount = (category) => {
  if (["Salary", "Freelance"].includes(category))
    return +(Math.random() * 4000 + 1500).toFixed(2);
  if (category === "Rent") return 1800;
  return +(Math.random() * 250 + 5).toFixed(2);
};

export const mockTransactions = Array.from({ length: 100 }).map((_, i) => {
  const category = categories[Math.floor(Math.random() * categories.length)];
  const descriptionList = descriptions[category];
  const description =
    descriptionList[Math.floor(Math.random() * descriptionList.length)];

  const type = ["Salary", "Freelance", "Investments"].includes(category)
    ? "income"
    : "expense";

  return {
    id: `txn_${i + 1}`,
    description,
    category,
    amount: randomAmount(category),
    type,
    date: randomDate(),
  };
});
