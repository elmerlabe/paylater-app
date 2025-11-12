"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";

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
}

export default function MemberBalanceDetails({
  params,
}: {
  params: Promise<{ eventId: string; memberId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [balance, setBalance] = useState<MemberBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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

      if (balancesData.balances && balancesData.balances[resolvedParams.memberId]) {
        setBalance(balancesData.balances[resolvedParams.memberId]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
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

  if (!event || !balance) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Member not found</div>
      </div>
    );
  }

  const totalToPay = balance.willPay.reduce((sum, debt) => sum + debt.amount, 0);
  const totalToReceive = balance.willReceive.reduce((sum, credit) => sum + credit.amount, 0);

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
            <h1 className="text-2xl font-bold">{balance.memberName}</h1>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {totalToPay > 0 && (
            <div className="rounded-lg overflow-hidden shadow-sm">
              <div className="bg-pink-primary p-4 text-white font-semibold">
                <div className="flex justify-between items-center">
                  <span>WILL PAY</span>
                  <span>₱ {totalToPay.toFixed(0)}</span>
                </div>
              </div>
              <div className="bg-white divide-y">
                {balance.willPay.map((debt, index) => (
                  <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-pink-primary font-semibold text-lg min-w-[60px]">
                        {debt.amount.toFixed(0)}
                      </span>
                      <div className="flex-1">
                        <div className="text-gray-900 font-medium">{debt.toMemberName}</div>
                        <div className="text-gray-400 text-sm">Owes</div>
                      </div>
                    </div>
                    <svg
                      className="w-5 h-5 text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalToReceive > 0 && (
            <div className="rounded-lg overflow-hidden shadow-sm">
              <div className="bg-pink-primary p-4 text-white font-semibold">
                <div className="flex justify-between items-center">
                  <span>WILL RECEIVE</span>
                  <span>₱ {totalToReceive.toFixed(0)}</span>
                </div>
              </div>
              <div className="bg-white divide-y">
                {balance.willReceive.map((credit, index) => (
                  <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <span className="text-pink-primary font-semibold text-lg min-w-[60px]">
                        {credit.amount.toFixed(0)}
                      </span>
                      <div className="flex-1">
                        <div className="text-gray-900 font-medium">{credit.fromMemberName}</div>
                        <div className="text-gray-400 text-sm">Owes you</div>
                      </div>
                    </div>
                    <button className="text-gray-300 text-sm px-3 py-1 border border-gray-200 rounded">
                      Settle
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalToPay === 0 && totalToReceive === 0 && (
            <div className="text-center py-16 text-gray-500">
              <p>This member is all settled up!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
