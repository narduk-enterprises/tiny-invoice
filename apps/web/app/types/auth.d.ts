/**
 * TinyInvoice extends the session User with app-specific profile fields.
 * The layer's #auth-utils User has id, email, name, isAdmin; we add business fields.
 */
declare module '#auth-utils' {
  interface User {
    businessName?: string | null
    businessAddress?: string | null
  }
}

export {}
