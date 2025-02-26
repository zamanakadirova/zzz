import { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Button } from "./components/ui/button";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = "https://api.example.com/transactions";

export default function FinanceTracker() {
  const [transactions, setTransactions] = useState([]);
  const [form, setForm] = useState({ date: "", amount: "", type: "income" });

  useEffect(() => {
    axios.get(API_URL).then((response) => {
      setTransactions(response.data);
    });
  }, []);

  const handleAddTransaction = () => {
    if (!form.date || !form.amount) return;
    const newTransaction = {
      ...form,
      id: Date.now(),
      amount: Number(form.amount),
    };
    setTransactions([...transactions, newTransaction]);
    setForm({ date: "", amount: "", type: "income" });
  };

  const exportData = (format) => {
    let dataStr = "";
    if (format === "csv") {
      dataStr =
        "Date,Type,Amount\n" +
        transactions.map((t) => `${t.date},${t.type},${t.amount}`).join("\n");
      const blob = new Blob([dataStr], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, "finance_data.csv");
    } else if (format === "json") {
      const blob = new Blob([JSON.stringify(transactions, null, 2)], {
        type: "application/json",
      });
      saveAs(blob, "finance_data.json");
    } else if (format === "pdf") {
      const doc = new jsPDF();
      doc.text("Қаржы бақылау деректері", 10, 10);
      autoTable(doc, {
        head: [["Date", "Type", "Amount"]],
        body: transactions.map((t) => [t.date, t.type, t.amount]),
      });
      doc.save("finance_data.pdf");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Қаржы бақылау жүйесі</h1>

      {/* Форма для добавления транзакций */}
      <div className="mb-4 flex gap-2">
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="border p-2"
        />
        <input
          type="number"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="border p-2"
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="border p-2"
        >
          <option value="income">Кіріс</option>
          <option value="expense">Шығыс</option>
        </select>
        <Button onClick={handleAddTransaction}>Қосу</Button>
      </div>

      {/* График */}
      <LineChart
        width={600}
        height={300}
        data={transactions}
        className="bg-white p-4 shadow-md"
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="amount" stroke="#8884d8" />
      </LineChart>

      {/* Экспорт кнопкалары */}
      <div className="mt-4 flex gap-2">
        <Button onClick={() => exportData("csv")}>CSV жүктеу</Button>
        <Button onClick={() => exportData("json")}>JSON жүктеу</Button>
        <Button onClick={() => exportData("pdf")}>PDF жүктеу</Button>
      </div>
    </div>
  );
}
