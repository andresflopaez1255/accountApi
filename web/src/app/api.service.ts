import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';
import { ApiEnvelope, BusinessSummary, Category, Client, Incident, Product, Provider, Sale, StreamingAccount } from './models';

/** Cambia esta URL al publicar la API; también admite window.__API_URL__ sin recompilar. */
const API_URL = (window as Window & { __API_URL__?: string }).__API_URL__ ?? 'http://localhost:4000';
const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private readonly tokenKey = 'af-playzone-access-token';
  readonly developmentMode = isLocalHost;
  private unwrap<T>() { return map((response: ApiEnvelope<T> | T) => ('data' in (response as ApiEnvelope<T>) ? (response as ApiEnvelope<T>).data : response as T)); }
  hasSession() { return Boolean(localStorage.getItem(this.tokenKey)); }
  signIn(email: string, password: string) {
    return this.http.post<ApiEnvelope<{ access_token: string }>>(`${API_URL}/log_in_vendors`, { email, password }).pipe(
      this.unwrap<{ access_token: string }>(),
      tap((session) => localStorage.setItem(this.tokenKey, session.access_token)),
    );
  }
  signOut() { localStorage.removeItem(this.tokenKey); }
  private options() {
    const token = localStorage.getItem(this.tokenKey);
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }
  clients() { return this.http.get<ApiEnvelope<Client[]>>(`${API_URL}/users`, this.options()).pipe(this.unwrap<Client[]>()); }
  accounts() { return this.http.get<ApiEnvelope<StreamingAccount[]>>(`${API_URL}/accounts`, this.options()).pipe(this.unwrap<StreamingAccount[]>()); }
  categories() { return this.http.get<ApiEnvelope<Category[]>>(`${API_URL}/categories`, this.options()).pipe(this.unwrap<Category[]>()); }
  createClient(client: Omit<Client, 'id' | 'accounts'>) { return this.http.post(`${API_URL}/new_user`, client, this.options()); }
  updateClient(client: Client) { return this.http.post(`${API_URL}/update_user`, client, this.options()); }
  deleteClient(id: string) { return this.http.delete(`${API_URL}/delete_user?id=${encodeURIComponent(id)}`, this.options()); }
  createAccount(account: Omit<StreamingAccount, 'id' | 'category' | 'category_name' | 'name_user' | 'cellphone_user'>) { return this.http.post(`${API_URL}/new_account`, account, this.options()); }
  updateAccount(account: StreamingAccount) { return this.http.post(`${API_URL}/update_account`, account, this.options()); }
  deleteAccount(id: string) { return this.http.delete(`${API_URL}/delete_account?id=${encodeURIComponent(id)}`, this.options()); }
  createCategory(category_name: string) { return this.http.post(`${API_URL}/new_category`, { category_name }, this.options()); }
  updateCategory(id: string, category_name: string) { return this.http.post(`${API_URL}/update_category?id=${encodeURIComponent(id)}`, { id, category_name }, this.options()); }
  deleteCategory(id: string) { return this.http.delete(`${API_URL}/delete_category?id=${encodeURIComponent(id)}`, this.options()); }
  sales() { return this.http.get<ApiEnvelope<Sale[]>>(`${API_URL}/sales`, this.options()).pipe(this.unwrap<Sale[]>()); }
  createSale(sale: Omit<Sale, 'id'>) { return this.http.post(`${API_URL}/new_sale`, sale, this.options()); }
  updateSale(sale: Sale) { return this.http.post(`${API_URL}/update_sale`, sale, this.options()); }
  deleteSale(id: string) { return this.http.delete(`${API_URL}/delete_sale?id=${encodeURIComponent(id)}`, this.options()); }
  providers() { return this.http.get<ApiEnvelope<Provider[]>>(`${API_URL}/providers`, this.options()).pipe(this.unwrap<Provider[]>()); }
  createProvider(provider: Omit<Provider, 'id'>) { return this.http.post(`${API_URL}/new_provider`, provider, this.options()); }
  updateProvider(provider: Provider) { return this.http.post(`${API_URL}/update_provider`, provider, this.options()); }
  deleteProvider(id: string) { return this.http.delete(`${API_URL}/delete_provider?id=${encodeURIComponent(id)}`, this.options()); }
  incidents() { return this.http.get<ApiEnvelope<Incident[]>>(`${API_URL}/incidents`, this.options()).pipe(this.unwrap<Incident[]>()); }
  createIncident(incident: Omit<Incident, 'id'>) { return this.http.post(`${API_URL}/new_incident`, incident, this.options()); }
  updateIncident(incident: Incident) { return this.http.post(`${API_URL}/update_incident`, incident, this.options()); }
  deleteIncident(id: string) { return this.http.delete(`${API_URL}/delete_incident?id=${encodeURIComponent(id)}`, this.options()); }
  summary() { return this.http.get<ApiEnvelope<BusinessSummary>>(`${API_URL}/business_summary`, this.options()).pipe(this.unwrap<BusinessSummary>()); }
  products() { return this.http.get<ApiEnvelope<Product[]>>(`${API_URL}/products`, this.options()).pipe(this.unwrap<Product[]>()); }
  createProduct(product: Omit<Product, 'id'>) { return this.http.post(`${API_URL}/new_product`, product, this.options()); }
  updateProduct(product: Product) { return this.http.post(`${API_URL}/update_product`, product, this.options()); }
  deleteProduct(id: string) { return this.http.delete(`${API_URL}/delete_product?id=${encodeURIComponent(id)}`, this.options()); }
}
