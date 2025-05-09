import React, { useState } from "react";
import DashboardWrapper from "../../components/shared/DashboardWrapper";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { db } from "../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { HandCoins, Percent, MapPin } from "lucide-react";

const LenderPreferencesForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    maxAmount: "",
    interestRate: "",
    location: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addDoc(collection(db, "lenders"), formData);
      setFormData({ name: "", maxAmount: "", interestRate: "", location: "" });
      alert("Lender preferences saved successfully!");
    } catch (err) {
      console.error("Error saving preferences:", err);
      alert("Something went wrong. Try again.");
    }
    setSubmitting(false);
  };

  return (
    <DashboardWrapper>
      <h1 className="text-2xl font-bold mb-6 text-gradient bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
        Set Your Lending Preferences
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-900 border border-gray-800 rounded-2xl p-6 max-w-xl space-y-4"
      >
        <div>
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <span>Name</span>
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your name (optional)"
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <HandCoins size={16} className="text-yellow-400" /> Max Lend Amount
          </label>
          <Input
            name="maxAmount"
            type="number"
            value={formData.maxAmount}
            onChange={handleChange}
            placeholder="e.g., 5000"
            required
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <Percent size={16} className="text-blue-400" /> Interest Rate (%)
          </label>
          <Input
            name="interestRate"
            type="number"
            value={formData.interestRate}
            onChange={handleChange}
            placeholder="e.g., 5"
            required
            className="mt-1"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
            <MapPin size={16} className="text-red-400" /> Location
          </label>
          <Input
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="City or region (optional)"
            className="mt-1"
          />
        </div>

        <Button
          type="submit"
          disabled={submitting}
          className="w-full bg-green-600 hover:bg-green-700 mt-4"
        >
          {submitting ? "Saving..." : "Save Preferences"}
        </Button>
      </form>
    </DashboardWrapper>
  );
};

export default LenderPreferencesForm;