"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

interface Member {
  id: string;
  name: string;
}

interface Event {
  id: string;
  name: string;
  color: string;
  members: Member[];
}

export default function CreateTransaction({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidById, setPaidById] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvent();
  }, []);

  const fetchEvent = async () => {
    try {
      const res = await fetch(`/api/events/${resolvedParams.eventId}`);
      const data = await res.json();
      if (data.event) {
        setEvent(data.event);
        // Select all members by default
        const allMemberIds = new Set(data.event.members.map((m: Member) => m.id));
        setSelectedMembers(allMemberIds);
      }
    } catch (error) {
      console.error("Error fetching event:", error);
    }
  };

  const toggleMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!paidById) {
      setError("Please select who paid");
      return;
    }

    if (selectedMembers.size === 0) {
      setError("Please select at least one member to split with");
      return;
    }

    // Split equally among selected members
    const splitAmount = amountNum / selectedMembers.size;
    const splits = Array.from(selectedMembers).map((memberId) => ({
      memberId,
      amount: splitAmount,
    }));

    setLoading(true);

    try {
      const res = await fetch(`/api/events/${resolvedParams.eventId}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: description.trim(),
          amount: amountNum,
          paidById,
          splits,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create transaction");
        setLoading(false);
        return;
      }

      router.push(`/events/${resolvedParams.eventId}`);
    } catch (err) {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div
          className="p-6 text-white relative"
          style={{ backgroundColor: event.color }}
        >
          <button
            onClick={() => router.push(`/events/${event.id}`)}
            className="absolute top-6 left-6"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <div className="text-center">
            <h1 className="text-2xl font-bold">Add Transaction</h1>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-sm p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-primary focus:border-transparent outline-none"
                placeholder="Dinner, Groceries, etc."
                required
              />
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                Amount (₱)
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-primary focus:border-transparent outline-none"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700 mb-2">
                Paid by
              </label>
              <select
                id="paidBy"
                value={paidById}
                onChange={(e) => setPaidById(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-primary focus:border-transparent outline-none"
                required
              >
                <option value="">Select member</option>
                {event.members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Split with (equally)
              </label>
              <div className="space-y-2">
                {event.members.map((member) => (
                  <label
                    key={member.id}
                    className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.has(member.id)}
                      onChange={() => toggleMember(member.id)}
                      className="w-5 h-5 text-pink-primary rounded focus:ring-pink-primary"
                    />
                    <span className="text-gray-900">{member.name}</span>
                  </label>
                ))}
              </div>
              {selectedMembers.size > 0 && amount && (
                <p className="mt-2 text-sm text-gray-600">
                  Each person pays: ₱{(parseFloat(amount) / selectedMembers.size).toFixed(2)}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-yellow-primary hover:bg-yellow-dark text-gray-900 font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creating..." : "Add Transaction"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
