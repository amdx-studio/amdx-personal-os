export interface Account {
  id: string
  label: string
  iconKey: string
  amount: number
  createdAt: string
}

export type CreateAccountInput = Pick<Account, 'label' | 'iconKey' | 'amount'> &
  Partial<Pick<Account, 'id'>>

export type UpdateAccountInput = Partial<Pick<Account, 'label' | 'iconKey' | 'amount'>>

export interface Budget {
  id: string
  category: string
  limit: number
  createdAt: string
}

export type CreateBudgetInput = Pick<Budget, 'category' | 'limit'>
export type UpdateBudgetInput = Partial<Pick<Budget, 'category' | 'limit'>>

export interface SavingsGoal {
  id: string
  name: string
  target: number
  current: number
  createdAt: string
}

export type CreateSavingsGoalInput = Pick<SavingsGoal, 'name' | 'target'> &
  Partial<Pick<SavingsGoal, 'current'>>

export type UpdateSavingsGoalInput = Partial<Pick<SavingsGoal, 'name' | 'target' | 'current'>>

export interface Bill {
  id: string
  name: string
  amount: number
  dueDate: string // ISO date, format YYYY-MM-DD
  createdAt: string
}

export type CreateBillInput = Pick<Bill, 'name' | 'amount' | 'dueDate'>
export type UpdateBillInput = Partial<Pick<Bill, 'name' | 'amount' | 'dueDate'>>

export interface WishlistItem {
  id: string
  name: string
  price?: number
  createdAt: string
}

export type CreateWishlistItemInput = Pick<WishlistItem, 'name'> &
  Partial<Pick<WishlistItem, 'price'>>

export type UpdateWishlistItemInput = Partial<Pick<WishlistItem, 'name' | 'price'>>

export interface Asset {
  id: string
  name: string
  value?: number
  createdAt: string
}

export type CreateAssetInput = Pick<Asset, 'name'> & Partial<Pick<Asset, 'value'>>
export type UpdateAssetInput = Partial<Pick<Asset, 'name' | 'value'>>