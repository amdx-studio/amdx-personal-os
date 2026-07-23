export type TransactionType = 'income' | 'expense'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  category: string
  description: string
  date: string // ISO date, format YYYY-MM-DD
  createdAt: string
  accountId?: string
}

export type CreateTransactionInput =
  Pick<Transaction, 'type' | 'amount' | 'category' | 'date'> &
  Partial<Pick<Transaction, 'description'>> & {
    accountId?: string
  }

export type UpdateTransactionInput =
  Partial<
    Pick<
      Transaction,
      'type' | 'amount' | 'category' | 'description' | 'date'
    >
  > & {
    accountId?: string
  }