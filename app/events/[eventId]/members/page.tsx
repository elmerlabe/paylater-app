"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

export default function AddMembers({ params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [eventColor, setEventColor] = useState("#EC4899");
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState<string[]>([]);
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
        setEventName(data.event.name);
        setEventColor(data.event.color);
        const existingMembers = data.event.members.map((m: any) => m.name);
        setMembers(existingMembers);
      }
    } catch (error) {
      console.error("Error fetching event:", error);
    }
  };

  const handleAddMember = () => {
    const trimmedName = memberInput.trim();

    if (!trimmedName) {
      return;
    }

    if (members.includes(trimmedName)) {
      setError("Member already added");
      return;
    }

    setMembers([...members, trimmedName]);
    setMemberInput("");
    setError("");
  };

  const handleRemoveMember = (memberToRemove: string) => {
    setMembers(members.filter((m) => m !== memberToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddMember();
    }
  };

  const handleSaveEvent = async () => {
    if (members.length === 0) {
      setError("Please add at least one member");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/events/${resolvedParams.eventId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          members,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add members");
        setLoading(false);
        return;
      }

      router.push(`/events/${resolvedParams.eventId}`);
    } catch (err) {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-primary to-purple-light">
      <div className="max-w-md mx-auto px-4 py-8">
        <div className="bg-white rounded-t-3xl min-h-screen">
          <div
            className="rounded-t-3xl p-6 text-white"
            style={{ backgroundColor: eventColor }}
          >
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold">{eventName}</h1>
              <button className="w-10 h-10 bg-yellow-primary rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-gray-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </button>
            </div>
            <p className="text-sm opacity-90">{members.length} Members</p>
          </div>

          <div className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="bg-white rounded-lg p-4 min-h-[200px]">
              <input
                type="text"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border-b-2 border-gray-300 focus:border-purple-primary outline-none transition-colors text-center"
                placeholder="Enter member name"
              />

              <div className="mt-6 space-y-2">
                {members.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No members yet
                  </div>
                ) : (
                  members.map((member) => (
                    <div
                      key={member}
                      className="flex items-center justify-between bg-purple-50 rounded-lg px-4 py-3 border border-purple-200"
                    >
                      <span className="text-gray-900 font-medium">{member}</span>
                      <button
                        onClick={() => handleRemoveMember(member)}
                        className="text-purple-400 hover:text-red-500 transition-colors font-bold text-lg"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={handleSaveEvent}
              disabled={loading || members.length === 0}
              className="w-full bg-yellow-primary hover:bg-yellow-dark text-gray-900 font-semibold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Event"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
