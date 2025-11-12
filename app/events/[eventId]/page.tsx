"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Member {
  id: string;
  name: string;
}

interface MemberBalance {
  memberId: string;
  memberName: string;
  balance: number;
  willPay: Array<{ toMemberId: string; toMemberName: string; amount: number }>;
  willReceive: Array<{ fromMemberId: string; fromMemberName: string; amount: number }>;
}

interface Event {
  id: string;
  name: string;
  color: string;
  members: Member[];
}

export default function EventDetails({ params }: { params: Promise<{ eventId: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [balances, setBalances] = useState<Record<string, MemberBalance>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventDetails();
  }, []);

  const fetchEventDetails = async () => {
    try {
      const [eventRes, balancesRes] = await Promise.all([
        fetch(`/api/events/${resolvedParams.eventId}`),
        fetch(`/api/events/${resolvedParams.eventId}/balances`),
      ]);

      const eventData = await eventRes.json();
      const balancesData = await balancesRes.json();

      if (eventData.event) {
        setEvent(eventData.event);
      }

      if (balancesData.balances) {
        setBalances(balancesData.balances);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Event not found</div>
      </div>
    );
  }

  const getTotalOwed = (balance: MemberBalance) =>
    balance.willPay.reduce((sum, debt) => sum + debt.amount, 0);

  const getTotalToReceive = (balance: MemberBalance) =>
    balance.willReceive.reduce((sum, credit) => sum + credit.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div
          className="p-6 text-white relative"
          style={{ backgroundColor: event.color }}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push("/events")}
              className="p-2"
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

            <button className="p-2">
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>

          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold mb-1">{event.name}</h1>
            <p className="text-sm opacity-90">
              {event.members.length} {event.members.length === 1 ? "Member" : "Members"}
            </p>
          </div>

          <button
            className="w-full bg-yellow-primary text-gray-900 px-4 py-3 rounded-lg font-semibold hover:bg-yellow-dark transition-colors"
            onClick={() => router.push(`/events/${event.id}/transactions/create`)}
          >
            Transact
          </button>
        </div>

        <div className="p-6">
          {event.members.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">No members in this event</p>
              <button
                onClick={() => router.push(`/events/${event.id}/members`)}
                className="px-6 py-3 bg-yellow-primary hover:bg-yellow-dark text-gray-900 font-semibold rounded-lg transition-colors"
              >
                Add Members
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="divide-y">
                {event.members.map((member) => {
                  const balance = balances[member.id];
                  const totalOwed = balance ? getTotalOwed(balance) : 0;
                  const totalToReceive = balance ? getTotalToReceive(balance) : 0;
                  const netBalance = totalToReceive - totalOwed;

                  return (
                    <Link
                      key={member.id}
                      href={`/events/${event.id}/members/${member.id}`}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-medium text-gray-900 flex-1">{member.name}</span>

                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            {netBalance === 0 ? "0" : ""}
                          </span>
                        </div>

                        <div className="text-right min-w-[80px]">
                          {totalToReceive > 0 && (
                            <div className="text-green-600 font-medium">
                              {totalToReceive.toFixed(0)}
                            </div>
                          )}
                          {totalOwed > 0 && (
                            <div className="text-gray-400 text-sm">
                              {totalOwed.toFixed(0)}
                            </div>
                          )}
                          {netBalance === 0 && (
                            <div className="text-gray-400">0</div>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
