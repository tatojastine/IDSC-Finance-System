import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import Login from "./Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState("income");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const API_URL = "http://localhost:5000/api/transactions";

  useEffect(() => {
    if (isLoggedIn) {
      fetchTransactions();
    }
  }, [isLoggedIn]);

  async function fetchTransactions() {
    try {
      const response = await axios.get(API_URL);
      setTransactions(response.data);
    } catch (error) {
      console.error("Error loading transactions:", error);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!amount || !description || !category || !date) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await axios.post(API_URL, {
        type,
        amount: Number(amount),
        description,
        category,
        date,
      });

      setAmount("");
      setDescription("");
      setCategory("");
      setDate("");

      fetchTransactions();
    } catch (error) {
      console.error("Error adding transaction:", error);
      alert("Failed to add transaction.");
    }
  }

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this transaction?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${id}`);
      fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction.");
    }
  }

  async function handleEdit(transaction) {
    const newAmount = prompt(
      "Enter new amount:",
      transaction.amount
    );

    if (newAmount === null) {
      return;
    }

    const newDescription = prompt(
      "Enter new description:",
      transaction.description
    );

    if (newDescription === null) {
      return;
    }

    const newCategory = prompt(
      "Enter new category:",
      transaction.category
    );

    if (newCategory === null) {
      return;
    }

    const currentDate = new Date(transaction.date)
      .toISOString()
      .split("T")[0];

    const newDate = prompt(
      "Enter new date (YYYY-MM-DD):",
      currentDate
    );

    if (newDate === null) {
      return;
    }

    if (!newAmount || !newDescription || !newCategory || !newDate) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      await axios.put(`${API_URL}/${transaction._id}`, {
        type: transaction.type,
        amount: Number(newAmount),
        description: newDescription,
        category: newCategory,
        date: newDate,
      });

      fetchTransactions();
    } catch (error) {
      console.error("Error updating transaction:", error);
      alert("Failed to update transaction.");
    }
  }

  function handleLogout() {
    setIsLoggedIn(false);
  }

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "income")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const totalExpenses = transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const balance = totalIncome - totalExpenses;

  const totalTransactions = transactions.length;

  const incomeTransactions = transactions.filter(
    (transaction) => transaction.type === "income"
  ).length;

  const expenseTransactions = transactions.filter(
    (transaction) => transaction.type === "expense"
  ).length;

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesFilter =
      filter === "all" || transaction.type === filter;

    const matchesSearch =
      transaction.description
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      transaction.category
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (!isLoggedIn) {
    return (
      <Login onLogin={() => setIsLoggedIn(true)} />
    );
  }

  return (
    <div className="app">
      <header>
        <h1>IDSC Finance Management System</h1>
        <p>Income and Expense Management</p>

        <button
          type="button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <main>
        <section className="dashboard">
          <div className="summary-card">
            <h3>Total Income</h3>
            <p>₱{totalIncome.toLocaleString()}</p>
          </div>

          <div className="summary-card">
            <h3>Total Expenses</h3>
            <p>₱{totalExpenses.toLocaleString()}</p>
          </div>

          <div className="summary-card">
            <h3>Current Balance</h3>
            <p>₱{balance.toLocaleString()}</p>
          </div>

          <div className="summary-card">
            <h3>Total Transactions</h3>
            <p>{totalTransactions}</p>
          </div>

          <div className="summary-card">
            <h3>Income Transactions</h3>
            <p>{incomeTransactions}</p>
          </div>

          <div className="summary-card">
            <h3>Expense Transactions</h3>
            <p>{expenseTransactions}</p>
          </div>
        </section>

        <section className="form-section">
          <h2>Add Transaction</h2>

          <form onSubmit={handleSubmit}>
            <label>Type</label>

            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value)
              }
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <label>Amount</label>

            <input
              type="number"
              value={amount}
              onChange={(event) =>
                setAmount(event.target.value)
              }
              placeholder="Enter amount"
            />

            <label>Description</label>

            <input
              type="text"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Enter description"
            />

            <label>Category</label>

            <input
              type="text"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              placeholder="Enter category"
            />

            <label>Date</label>

            <input
              type="date"
              value={date}
              onChange={(event) =>
                setDate(event.target.value)
              }
            />

            <button type="submit">
              Add Transaction
            </button>
          </form>
        </section>

        <section className="transactions-section">
          <h2>Transactions</h2>

          <label>Search Transactions</label>

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search description or category"
          />

          <label>Filter Transactions</label>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value)
            }
          >
            <option value="all">All</option>
            <option value="income">Income Only</option>
            <option value="expense">Expenses Only</option>
          </select>

          {filteredTransactions.length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            <div className="transaction-list">
              {filteredTransactions.map((transaction) => (
                <div
                  className="transaction"
                  key={transaction._id}
                >
                  <strong>{transaction.type}</strong>

                  <span>
                    ₱{transaction.amount.toLocaleString()}
                  </span>

                  <p>{transaction.description}</p>

                  <small>{transaction.category}</small>

                  <br />

                  <small>
                    Date:{" "}
                    {new Date(
                      transaction.date
                    ).toLocaleDateString()}
                  </small>

                  <br />

                  <button
                    type="button"
                    onClick={() =>
                      handleEdit(transaction)
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(transaction._id)
                    }
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

