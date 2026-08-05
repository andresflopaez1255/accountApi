export interface ApiEnvelope<T> { data: T; message?: string; status?: boolean; }
export interface Client { id: string; name_user: string; email_user?: string; cellphone_user: string; accounts?: string[]; }
export interface Category { id: string; category_name: string; }
export interface StreamingAccount { id: string; id_user: string; id_category: string; email_account: string; pass_account?: string; name_profile: string; code_profile: string | number; expiration_date: string; category?: string; category_name?: string; name_user?: string; cellphone_user?: string; }
export interface Sale { id: string; client_id: string; account_id?: string; provider_id?: string; price: number; cost: number; payment_status: 'paid' | 'pending' | 'partial' | 'refunded'; payment_method?: string; sale_date: string; renewal_date?: string; notes?: string; }
export interface Provider { id: string; name: string; contact?: string; notes?: string; }
export interface Incident { id: string; client_id: string; account_id?: string; type: string; status: 'open' | 'in_progress' | 'resolved'; due_date?: string; notes?: string; }
export interface BusinessSummary { revenue: number; cost: number; profit: number; pending: number; sales_count: number; open_incidents: number; }
export interface Product { id: string; line: 'game' | 'smart'; name: string; price: number; cost?: number; stock?: number; description?: string; image?: string; }
