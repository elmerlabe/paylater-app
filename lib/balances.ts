export interface MemberBalance {
  memberId: string;
  memberName: string;
  balance: number; // positive = will receive, negative = will pay
  willPay: Array<{ toMemberId: string; toMemberName: string; amount: number }>;
  willReceive: Array<{ fromMemberId: string; fromMemberName: string; amount: number }>;
}

export interface Transaction {
  id: string;
  paidBy: { id: string; name: string };
  amount: number;
  splits: Array<{ member: { id: string; name: string }; amount: number; settled: boolean }>;
}

export function calculateBalances(
  members: Array<{ id: string; name: string }>,
  transactions: Transaction[]
): Record<string, MemberBalance> {
  const balances: Record<string, MemberBalance> = {};

  // Initialize balances for all members
  members.forEach((member) => {
    balances[member.id] = {
      memberId: member.id,
      memberName: member.name,
      balance: 0,
      willPay: [],
      willReceive: [],
    };
  });

  // Track who owes whom
  const debts: Record<string, Record<string, number>> = {};

  // Calculate debts from transactions
  transactions.forEach((transaction) => {
    const payerId = transaction.paidBy.id;

    transaction.splits.forEach((split) => {
      if (!split.settled && split.member.id !== payerId) {
        const debtorId = split.member.id;

        // Initialize debt tracking
        if (!debts[debtorId]) {
          debts[debtorId] = {};
        }

        // Add debt
        if (!debts[debtorId][payerId]) {
          debts[debtorId][payerId] = 0;
        }

        debts[debtorId][payerId] += split.amount;
      }
    });
  });

  // Calculate balances and populate willPay/willReceive
  Object.entries(debts).forEach(([debtorId, creditors]) => {
    Object.entries(creditors).forEach(([creditorId, amount]) => {
      // Update balances
      balances[debtorId].balance -= amount;
      balances[creditorId].balance += amount;

      // Populate willPay for debtor
      const creditor = members.find((m) => m.id === creditorId);
      if (creditor) {
        balances[debtorId].willPay.push({
          toMemberId: creditorId,
          toMemberName: creditor.name,
          amount,
        });
      }

      // Populate willReceive for creditor
      const debtor = members.find((m) => m.id === debtorId);
      if (debtor) {
        balances[creditorId].willReceive.push({
          fromMemberId: debtorId,
          fromMemberName: debtor.name,
          amount,
        });
      }
    });
  });

  return balances;
}

export function getTotalOwed(balance: MemberBalance): number {
  return balance.willPay.reduce((sum, debt) => sum + debt.amount, 0);
}

export function getTotalToReceive(balance: MemberBalance): number {
  return balance.willReceive.reduce((sum, credit) => sum + credit.amount, 0);
}
