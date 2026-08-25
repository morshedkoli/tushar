interface PersonBase {
  id: number;
  name: string;
  phone: string | null;
  balance: number;
}

/** A contact as returned by the list endpoint, carrying its recency for sorting. */
export interface Person extends PersonBase {
  /** ISO date of the person's most recent transaction, null if never transacted. */
  lastActivity: string | null;
}

export interface Transaction {
  id: number;
  amount: number;
  type: "ADD" | "DEDUCT";
  description: string | null;
  date: string;
  /** Ledger balance immediately before this movement. */
  balanceBefore: number;
  /** Ledger balance immediately after this movement. */
  balanceAfter: number;
}

export interface TransactionWithPerson extends Transaction {
  person: Pick<PersonBase, "id" | "name">;
}

/** A contact as returned by the detail endpoint, with its full history. */
export interface PersonWithTransactions extends PersonBase {
  transactions: Transaction[];
}
