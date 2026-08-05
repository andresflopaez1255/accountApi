import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ApiService } from './api.service';
import { BusinessSummary, Category, Client, Incident, Product, Provider, Sale, StreamingAccount } from './models';

type View = 'inicio' | 'cuentas' | 'clientes' | 'categorias' | 'ventas' | 'juegos' | 'smart' | 'bot';
type Editor = 'account' | 'client' | 'category';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-canvas">
      @if (!authenticated()) {
        <section class="fixed inset-0 z-50 grid place-items-center bg-ink/80 p-4 backdrop-blur-sm">
          <form class="w-full max-w-sm rounded-3xl bg-white p-6 shadow-float" (ngSubmit)="signIn()">
            <div class="grid h-11 w-11 place-items-center rounded-2xl bg-brand font-black text-white">AF</div>
            <p class="mt-5 text-xs font-bold tracking-[.2em] text-brand">AF PLAYZONE</p>
            <h2 class="mt-2 text-2xl font-black text-ink">Activa tu panel</h2>
            <p class="mt-2 text-sm text-muted">Ingresa con tu cuenta de operador para consultar la operación.</p>
            <label class="mt-5 block text-sm font-bold text-ink">Correo<input [(ngModel)]="loginEmail" name="email" type="email" required class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand" placeholder="tu@correo.com"></label>
            <label class="mt-4 block text-sm font-bold text-ink">Contraseña<input [(ngModel)]="loginPassword" name="password" type="password" required class="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-brand" placeholder="••••••••"></label>
            @if (loginError()) { <p class="mt-3 text-sm font-medium text-brand">{{ loginError() }}</p> }
            <button [disabled]="signingIn()" class="mt-6 w-full rounded-xl bg-brand px-4 py-3 font-bold text-white disabled:opacity-60">{{ signingIn() ? 'Conectando…' : 'Entrar al panel' }}</button>
          </form>
        </section>
      }
      @if (editor()) {
        <section class="fixed inset-0 z-40 overflow-y-auto bg-ink/70 p-4 backdrop-blur-sm">
          <form class="mx-auto my-6 w-full max-w-lg rounded-3xl bg-white p-6 shadow-float" (ngSubmit)="saveEditor()">
            <div class="flex items-start justify-between gap-4"><div><p class="text-xs font-bold tracking-[.18em] text-brand">AF PLAYZONE</p><h2 class="mt-1 text-2xl font-black text-ink">{{ editorTitle() }}</h2><p class="mt-1 text-sm text-muted">Completa los datos y confirma para guardar.</p></div><button type="button" class="rounded-lg px-2 text-xl" (click)="closeEditor()">×</button></div>
            @if (editor() === 'account') {
              <div class="mt-5 grid gap-4 sm:grid-cols-2"><label class="form-label sm:col-span-2">Correo de la cuenta<input [(ngModel)]="accountForm.email_account" name="accountEmail" type="email" required class="form-input"></label><label class="form-label">Contraseña<input [(ngModel)]="accountForm.pass_account" name="accountPassword" required class="form-input"></label><label class="form-label">Perfil<input [(ngModel)]="accountForm.name_profile" name="accountProfile" required class="form-input"></label><label class="form-label">PIN<input [(ngModel)]="accountForm.code_profile" name="accountPin" type="number" required class="form-input"></label><label class="form-label">Vencimiento<input [(ngModel)]="accountForm.expiration_date" name="accountExpiration" required class="form-input" placeholder="DD/MM/AAAA"></label><label class="form-label">Cliente<select [(ngModel)]="accountForm.id_user" name="accountUser" required class="form-input"><option value="">Selecciona un cliente</option>@for (client of clients(); track client.id) { <option [value]="client.id">{{ client.name_user }}</option> }</select></label><label class="form-label">Plataforma<select [(ngModel)]="accountForm.id_category" name="accountCategory" required class="form-input"><option value="">Selecciona una plataforma</option>@for (category of categories(); track category.id) { <option [value]="category.id">{{ category.category_name }}</option> }</select></label></div>
            } @else if (editor() === 'client') {
              <div class="mt-5 grid gap-4"><label class="form-label">Nombre completo<input [(ngModel)]="clientForm.name_user" name="clientName" required class="form-input"></label><label class="form-label">Teléfono<input [(ngModel)]="clientForm.cellphone_user" name="clientPhone" required class="form-input"></label><label class="form-label">Correo (opcional)<input [(ngModel)]="clientForm.email_user" name="clientEmail" type="email" class="form-input"></label></div>
            } @else {
              <div class="mt-5"><label class="form-label">Nombre de plataforma<input [(ngModel)]="categoryForm.category_name" name="categoryName" required class="form-input" placeholder="Ej. Netflix perfil"></label></div>
            }
            @if (editorError()) { <p class="mt-4 text-sm font-medium text-brand">{{ editorError() }}</p> }
            <div class="mt-6 flex justify-end gap-3"><button type="button" class="rounded-xl px-4 py-3 text-sm font-bold text-muted" (click)="closeEditor()">Cancelar</button><button [disabled]="saving()" class="rounded-xl bg-brand px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{{ saving() ? 'Guardando…' : 'Guardar cambios' }}</button></div>
          </form>
        </section>
      }
      <header class="sticky top-0 z-20 border-b border-white/40 bg-canvas/90 px-4 py-3 backdrop-blur lg:hidden">
        <div class="flex items-center justify-between"><button class="font-bold text-ink" (click)="menuOpen.set(!menuOpen())">☰ <span class="ml-1 tracking-tight">AF PLAYZONE</span></button><span class="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">Operación</span></div>
      </header>
      <div class="mx-auto flex max-w-7xl">
        <aside class="fixed inset-y-0 left-0 z-30 w-72 border-r border-slate-100 bg-white p-5 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0" [class.-translate-x-full]="!menuOpen()" [class.translate-x-0]="menuOpen()">
          <div class="mb-10 flex items-center gap-3"><div class="grid h-10 w-10 place-items-center rounded-2xl bg-brand font-black text-white">AF</div><div><p class="font-bold tracking-tight text-ink">AF PLAYZONE</p><p class="text-xs text-slate-400">Centro de operación</p></div><button class="ml-auto lg:hidden" (click)="menuOpen.set(false)">✕</button></div>
          <nav class="space-y-1">
            <button class="nav-item w-full" [class.active]="view() === 'inicio'" (click)="navigate('inicio')">◈ Resumen</button>
            <button class="nav-item w-full" [class.active]="view() === 'cuentas'" (click)="navigate('cuentas')">▣ Cuentas</button>
            <button class="nav-item w-full" [class.active]="view() === 'clientes'" (click)="navigate('clientes')">◎ Clientes</button>
            <button class="nav-item w-full" [class.active]="view() === 'categorias'" (click)="navigate('categorias')">◇ Plataformas</button>
            <button class="nav-item w-full" [class.active]="view() === 'ventas'" (click)="navigate('ventas')">◉ Ventas y cobros</button>
            <button class="nav-item w-full" [class.active]="view() === 'juegos'" (click)="navigate('juegos')">▹ Juegos digitales</button>
            <button class="nav-item w-full" [class.active]="view() === 'smart'" (click)="navigate('smart')">◇ Smart y videojuegos</button>
            <button class="nav-item w-full" [class.active]="view() === 'bot'" (click)="navigate('bot')">✦ Guía del bot</button>
          </nav>
          <div class="mt-10 rounded-2xl bg-ink p-4 text-white"><p class="text-xs text-slate-300">ACCESO RÁPIDO</p><p class="mt-2 text-sm font-semibold">Revisa vencimientos cada mañana.</p><button (click)="navigate('cuentas')" class="mt-3 text-sm font-bold text-brand">Ver agenda →</button></div>
        </aside>
        <main class="w-full px-4 py-6 lg:px-10 lg:py-10">
          <div class="mb-7 flex items-end justify-between gap-3"><div><p class="text-xs font-bold uppercase tracking-[.18em] text-brand">Administración</p><h1 class="mt-1 text-2xl font-black tracking-tight text-ink sm:text-3xl">{{ title() }}</h1><p class="mt-1 text-sm text-slate-500">{{ subtitle() }}</p></div><button class="rounded-xl bg-ink px-4 py-3 text-sm font-bold text-white shadow-lg" (click)="refresh()">↻ Actualizar</button></div>

          @if (loading()) { <div class="card text-center text-slate-500">Cargando la operación…</div> }
          @if (dataError()) { <div class="mb-5 rounded-2xl border border-brand/25 bg-brand/5 p-4 text-sm text-ink"><p class="font-bold text-brand">No pudimos cargar la información.</p><p class="mt-1 text-muted">{{ dataError() }}</p></div> }
          @if (!loading() && view() === 'inicio') {
            <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <article class="card"><div class="icon-badge bg-brand/10 text-brand">▣</div><p class="mt-5 text-3xl font-black">{{ accounts().length }}</p><p class="text-sm text-slate-500">Cuentas activas</p></article>
              <article class="card"><div class="icon-badge bg-slate-100">$</div><p class="mt-5 text-3xl font-black">{{ summary().revenue | number }}</p><p class="text-sm text-slate-500">Ingresos cobrados</p></article>
              <article class="card"><div class="icon-badge bg-amber-100">◷</div><p class="mt-5 text-3xl font-black">{{ summary().pending | number }}</p><p class="text-sm text-slate-500">Cobros pendientes</p></article>
              <article class="card"><div class="icon-badge bg-rose-100">!</div><p class="mt-5 text-3xl font-black">{{ summary().open_incidents }}</p><p class="text-sm text-slate-500">Incidencias abiertas</p></article>
            </section>
            <section class="mt-6 grid gap-6 xl:grid-cols-[1.3fr_.7fr]"><div class="card"><div class="flex items-center justify-between"><h2 class="font-bold">Agenda de renovaciones</h2><button class="text-sm font-bold text-brand" (click)="navigate('cuentas')">Ver todas</button></div><div class="mt-4 space-y-3">@for (account of expiring().slice(0, 4); track account.id) { <div class="flex items-center gap-3 rounded-xl bg-canvas p-3"><div class="grid h-10 w-10 place-items-center rounded-full bg-white font-black text-brand">{{ account.category_name?.[0] || 'S' }}</div><div class="min-w-0 flex-1"><p class="truncate text-sm font-bold">{{ account.name_user || account.email_account }}</p><p class="truncate text-xs text-slate-500">{{ account.category_name || 'Plataforma' }} · {{ account.name_profile }}</p></div><span class="text-xs font-bold text-amber-600">{{ relativeDate(account.expiration_date) }}</span></div> } @empty { <p class="py-7 text-center text-sm text-slate-400">No hay vencimientos próximos.</p> }</div></div><div class="card bg-ink text-white"><p class="text-xs font-bold tracking-widest text-brand">BOT DE TELEGRAM</p><h2 class="mt-3 text-xl font-black">Opera sin abrir el panel.</h2><p class="mt-2 text-sm text-slate-300">Consulta, renueva y envía datos de acceso con flujos guiados.</p><button (click)="navigate('bot')" class="mt-6 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white">Abrir guía del bot</button></div></section>
          }

          @if (!loading() && view() === 'cuentas') { <section class="card"><div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><input [(ngModel)]="query" class="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand sm:max-w-sm" placeholder="Buscar cliente, perfil o plataforma"><div class="flex items-center gap-3"><span class="text-sm text-slate-500">{{ filteredAccounts().length }} resultados</span><button class="rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white" (click)="openAccount()">+ Cuenta</button></div></div><div class="space-y-3">@for (account of filteredAccounts(); track account.id) { <article class="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 p-3 sm:p-4"><div class="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 font-black text-brand">{{ (account.category_name || account.category || 'S')[0] }}</div><div class="min-w-[150px] flex-1"><p class="font-bold">{{ account.name_user || 'Cliente sin nombre' }}</p><p class="text-xs text-slate-500">{{ account.category_name || account.category || 'Plataforma' }} · Perfil {{ account.name_profile }}</p></div><div class="text-sm"><p class="font-bold" [class.text-rose-500]="isExpired(account.expiration_date)">{{ account.expiration_date }}</p><p class="text-xs text-slate-400">{{ relativeDate(account.expiration_date) }}</p></div><div class="flex gap-2"><button class="text-sm font-bold text-ink" (click)="openAccount(account)">Editar</button><button class="text-sm font-bold text-brand" (click)="remove('account', account.id)">Eliminar</button></div></article> } @empty { <p class="py-8 text-center text-sm text-slate-400">No encontramos cuentas con esa búsqueda.</p> }</div></section> }
          @if (!loading() && view() === 'clientes') { <section><div class="mb-4 flex justify-end"><button class="rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white" (click)="openClient()">+ Cliente</button></div><div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">@for (client of clients(); track client.id) { <article class="card"><div class="flex items-center gap-3"><div class="grid h-10 w-10 place-items-center rounded-full bg-brand/10 font-bold text-brand">{{ client.name_user[0] || '?' }}</div><div class="min-w-0"><p class="truncate font-bold">{{ client.name_user }}</p><p class="truncate text-sm text-slate-500">{{ client.cellphone_user }}</p></div></div><p class="mt-4 text-sm text-slate-500">{{ client.email_user || 'Sin correo registrado' }}</p><div class="mt-4 flex gap-3"><button class="text-sm font-bold text-ink" (click)="openClient(client)">Editar</button><button class="text-sm font-bold text-brand" (click)="remove('client', client.id)">Eliminar</button></div></article> } @empty { <div class="card text-slate-400">No hay clientes aún.</div> }</div></section> }
          @if (!loading() && view() === 'categorias') { <section><div class="mb-4 flex justify-end"><button class="rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white" (click)="openCategory()">+ Plataforma</button></div><div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">@for (category of categories(); track category.id) { <article class="card flex items-center gap-3"><div class="icon-badge bg-brand/10 text-brand">▶</div><div class="min-w-0 flex-1"><p class="font-bold">{{ category.category_name }}</p><p class="text-sm text-slate-500">{{ accountsFor(category.id) }} cuentas registradas</p></div><div class="flex gap-2"><button class="text-sm font-bold text-ink" (click)="openCategory(category)">Editar</button><button class="text-sm font-bold text-brand" (click)="remove('category', category.id)">Eliminar</button></div></article> } @empty { <div class="card text-slate-400">No hay plataformas registradas.</div> }</div></section> }
          @if (!loading() && view() === 'ventas') { <section class="grid gap-5 xl:grid-cols-[1.3fr_.7fr]"><div class="card"><div class="flex items-center justify-between"><div><h2 class="font-bold">Ventas y renovaciones</h2><p class="text-sm text-muted">Registro de cobros y próxima vigencia.</p></div><span class="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">{{ sales().length }} registros</span></div><div class="mt-4 space-y-3">@for (sale of sales(); track sale.id) { <article class="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 p-3"><div class="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 font-bold text-brand">$</div><div class="min-w-[120px] flex-1"><p class="font-bold">{{ clientName(sale.client_id) }}</p><p class="text-xs text-muted">{{ sale.sale_date }} · Renueva: {{ sale.renewal_date || 'Sin fecha' }}</p></div><div><p class="font-bold">{{ sale.price | number }}</p><p class="text-xs" [class.text-brand]="sale.payment_status === 'pending'">{{ sale.payment_status }}</p></div></article> } @empty { <p class="py-8 text-center text-sm text-muted">Aún no hay ventas registradas.</p> }</div></div><aside class="card"><p class="text-xs font-bold tracking-widest text-brand">RESUMEN COMERCIAL</p><dl class="mt-5 space-y-4 text-sm"><div class="flex justify-between"><dt class="text-muted">Ingresos</dt><dd class="font-bold">{{ summary().revenue | number }}</dd></div><div class="flex justify-between"><dt class="text-muted">Costos</dt><dd class="font-bold">{{ summary().cost | number }}</dd></div><div class="flex justify-between border-t pt-4"><dt class="font-bold">Utilidad</dt><dd class="font-black text-brand">{{ summary().profit | number }}</dd></div><div class="flex justify-between"><dt class="text-muted">Proveedores</dt><dd class="font-bold">{{ providers().length }}</dd></div><div class="flex justify-between"><dt class="text-muted">Incidencias</dt><dd class="font-bold">{{ incidents().length }}</dd></div></dl></aside></section> }
          @if (!loading() && (view() === 'juegos' || view() === 'smart')) { <section><div class="mb-6 rounded-3xl bg-ink p-6 text-white"><p class="text-xs font-bold tracking-widest text-brand">AF PLAYZONE / {{ view() === 'juegos' ? 'GAME' : 'SMART' }}</p><h2 class="mt-2 text-2xl font-black">{{ view() === 'juegos' ? 'Juegos digitales, listos para activar.' : 'Tecnología para jugar y conectar.' }}</h2><p class="mt-2 max-w-xl text-sm text-slate-300">Gestiona precio, costo, existencias y disponibilidad de cada producto desde un solo catálogo.</p></div><div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">@for (product of productsFor(view() === 'juegos' ? 'game' : 'smart'); track product.id) { <article class="card"><p class="text-xs font-bold tracking-widest text-brand">{{ product.line === 'game' ? 'GAME' : 'SMART' }}</p><h3 class="mt-2 text-lg font-black">{{ product.name }}</h3><p class="mt-2 min-h-10 text-sm text-muted">{{ product.description || 'Producto disponible para venta.' }}</p><div class="mt-5 flex items-end justify-between"><div><p class="text-xl font-black">{{ product.price | number }}</p><p class="text-xs text-muted">Stock: {{ product.stock ?? 'Por confirmar' }}</p></div><span class="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">Disponible</span></div></article> } @empty { <div class="card sm:col-span-2 xl:col-span-3"><h3 class="font-bold">Catálogo listo para recibir productos</h3><p class="mt-1 text-sm text-muted">Crea productos en la API con línea <code>game</code> o <code>smart</code> para que aparezcan aquí.</p></div> }</div></section> }
          @if (!loading() && view() === 'bot') { <section class="grid gap-4 lg:grid-cols-2"><article class="card"><p class="text-xs font-bold tracking-widest text-brand">EXPERIENCIA OPERATIVA</p><h2 class="mt-2 text-xl font-black">Flujo recomendado</h2><ol class="mt-5 space-y-4">@for (step of botSteps; track step.number) { <li class="flex gap-3"><span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-xs font-bold text-white">{{ step.number }}</span><div><p class="font-bold">{{ step.title }}</p><p class="text-sm text-slate-500">{{ step.description }}</p></div></li> }</ol></article><article class="rounded-2xl bg-ink p-5 text-white shadow-float"><p class="text-xs font-bold tracking-widest text-brand">COMANDOS SUGERIDOS</p><div class="mt-5 space-y-3">@for (command of commands; track command.command) { <div class="rounded-xl bg-white/10 p-3"><code class="font-bold text-brand">{{ command.command }}</code><p class="mt-1 text-sm text-slate-300">{{ command.description }}</p></div> }</div><p class="mt-6 rounded-xl border border-brand/50 bg-brand/10 p-3 text-sm text-white">El bot debe aceptar únicamente usuarios autorizados y pedir confirmación antes de modificar datos.</p></article></section> }
        </main>
      </div>
    </div>`,
})
export class AppComponent implements OnInit {
  private api = inject(ApiService);
  view = signal<View>('inicio'); menuOpen = signal(false); loading = signal(true); query = '';
  authenticated = signal(this.api.developmentMode || this.api.hasSession()); signingIn = signal(false); loginError = signal(''); dataError = signal('');
  loginEmail = ''; loginPassword = '';
  clients = signal<Client[]>([]); accounts = signal<StreamingAccount[]>([]); categories = signal<Category[]>([]);
  sales = signal<Sale[]>([]); providers = signal<Provider[]>([]); incidents = signal<Incident[]>([]); products = signal<Product[]>([]);
  summary = signal<BusinessSummary>({ revenue: 0, cost: 0, profit: 0, pending: 0, sales_count: 0, open_incidents: 0 });
  editor = signal<Editor | null>(null); editingId = ''; saving = signal(false); editorError = signal('');
  accountForm = { id_user: '', id_category: '', email_account: '', pass_account: '', name_profile: '', code_profile: 0, expiration_date: '' };
  clientForm = { name_user: '', cellphone_user: '', email_user: '' };
  categoryForm = { category_name: '' };
  title = computed(() => ({ inicio: 'Buenos días, operador', cuentas: 'Cuentas de streaming', clientes: 'Clientes', categorias: 'Plataformas', ventas: 'Ventas y cobros', juegos: 'Juegos digitales', smart: 'Smart y videojuegos', bot: 'Tu asistente de Telegram' }[this.view()]));
  subtitle = computed(() => ({ inicio: 'Todo lo importante de tu negocio, en un vistazo.', cuentas: 'Consulta y organiza accesos por vencimiento.', clientes: 'Tu cartera, siempre a la mano.', categorias: 'Organiza tus plataformas y servicios.', ventas: 'Controla ingresos, costos, cobros y renovaciones.', juegos: 'Activa, entrega y vende sin perder el control.', smart: 'Organiza productos físicos y disponibilidad.', bot: 'Flujos simples para atender más rápido.' }[this.view()]));
  filteredAccounts = computed(() => { const text = this.query.toLowerCase().trim(); return !text ? this.accounts() : this.accounts().filter(a => [a.name_user, a.email_account, a.category_name, a.name_profile].some(v => v?.toLowerCase().includes(text))); });
  expiring = computed(() => this.accounts().filter(a => { const days = this.daysUntil(a.expiration_date); return days >= 0 && days <= 7; }).sort((a,b) => this.daysUntil(a.expiration_date) - this.daysUntil(b.expiration_date)));
  expired = computed(() => this.accounts().filter(a => this.isExpired(a.expiration_date)));
  botSteps = [{ number: 1, title: 'Elige una acción', description: 'Usa botones: crear, buscar, renovar o enviar datos.' }, { number: 2, title: 'Confirma el resultado', description: 'El bot muestra un resumen antes de guardar cambios.' }, { number: 3, title: 'Comparte de forma segura', description: 'Genera un mensaje listo para enviar al cliente.' }];
  commands = [{ command: '/hoy', description: 'Vencidas y próximas a vencer.' }, { command: '/cliente', description: 'Busca historial y cuentas del cliente.' }, { command: '/renovar', description: 'Extiende la vigencia en pocos pasos.' }, { command: '/enviar', description: 'Prepara los datos de acceso para compartir.' }];
  editorTitle = computed(() => `${this.editingId ? 'Editar' : 'Nueva'} ${({ account: 'cuenta', client: 'cliente', category: 'plataforma' } as Record<Editor, string>)[this.editor() || 'account']}`);
  ngOnInit() { if (this.authenticated()) this.refresh(); else this.loading.set(false); }
  signIn() {
    this.signingIn.set(true); this.loginError.set('');
    this.api.signIn(this.loginEmail.trim(), this.loginPassword).subscribe({
      next: () => { this.authenticated.set(true); this.signingIn.set(false); this.refresh(); },
      error: () => { this.signingIn.set(false); this.loginError.set('No pudimos iniciar sesión. Verifica tus datos.'); },
    });
  }
  refresh() { if (!this.authenticated()) { this.loading.set(false); return; } this.loading.set(true); this.dataError.set(''); forkJoin({ clients: this.api.clients(), accounts: this.api.accounts(), categories: this.api.categories(), sales: this.api.sales(), providers: this.api.providers(), incidents: this.api.incidents(), products: this.api.products(), summary: this.api.summary() }).subscribe({ next: result => { this.clients.set(result.clients); this.accounts.set(result.accounts); this.categories.set(result.categories); this.sales.set(result.sales); this.providers.set(result.providers); this.incidents.set(result.incidents); this.products.set(result.products); this.summary.set(result.summary); this.loading.set(false); }, error: () => { this.loading.set(false); this.dataError.set('Verifica que la API esté iniciada en el puerto 4000 y que Firebase tenga una credencial configurada.'); } }); }
  openAccount(account?: StreamingAccount) { this.editingId = account?.id || ''; this.accountForm = account ? { id_user: account.id_user, id_category: account.id_category, email_account: account.email_account, pass_account: account.pass_account || '', name_profile: account.name_profile, code_profile: Number(account.code_profile), expiration_date: account.expiration_date } : { id_user: '', id_category: '', email_account: '', pass_account: '', name_profile: '', code_profile: 0, expiration_date: '' }; this.openEditor('account'); }
  openClient(client?: Client) { this.editingId = client?.id || ''; this.clientForm = client ? { name_user: client.name_user, cellphone_user: client.cellphone_user, email_user: client.email_user || '' } : { name_user: '', cellphone_user: '', email_user: '' }; this.openEditor('client'); }
  openCategory(category?: Category) { this.editingId = category?.id || ''; this.categoryForm = { category_name: category?.category_name || '' }; this.openEditor('category'); }
  private openEditor(editor: Editor) { this.editorError.set(''); this.editor.set(editor); }
  closeEditor() { this.editor.set(null); this.editorError.set(''); }
  saveEditor() {
    const entity = this.editor(); if (!entity) return;
    this.saving.set(true); this.editorError.set('');
    const done = () => { this.saving.set(false); this.closeEditor(); this.refresh(); };
    const fail = () => { this.saving.set(false); this.editorError.set('No pudimos guardar. Revisa los campos e inténtalo de nuevo.'); };
    if (entity === 'account') {
      const request = this.editingId ? this.api.updateAccount({ id: this.editingId, ...this.accountForm }) : this.api.createAccount(this.accountForm);
      request.subscribe({ next: done, error: fail }); return;
    }
    if (entity === 'client') {
      const request = this.editingId ? this.api.updateClient({ id: this.editingId, ...this.clientForm }) : this.api.createClient(this.clientForm);
      request.subscribe({ next: done, error: fail }); return;
    }
    const request = this.editingId ? this.api.updateCategory(this.editingId, this.categoryForm.category_name) : this.api.createCategory(this.categoryForm.category_name);
    request.subscribe({ next: done, error: fail });
  }
  remove(entity: Editor, id: string) {
    if (!window.confirm('¿Seguro que deseas eliminar este registro? Esta acción no se puede deshacer.')) return;
    const request = entity === 'account' ? this.api.deleteAccount(id) : entity === 'client' ? this.api.deleteClient(id) : this.api.deleteCategory(id);
    request.subscribe({ next: () => this.refresh(), error: () => this.dataError.set('No pudimos eliminar el registro. Puede tener datos asociados.') });
  }
  navigate(view: View) { this.view.set(view); this.menuOpen.set(false); }
  accountsFor(categoryId: string) { return this.accounts().filter(a => a.id_category === categoryId).length; }
  clientName(id: string) { return this.clients().find((client) => client.id === id)?.name_user || 'Cliente eliminado'; }
  productsFor(line: Product['line']) { return this.products().filter((product) => product.line === line); }
  isExpired(date: string) { return this.daysUntil(date) < 0; }
  relativeDate(date: string) { const days = this.daysUntil(date); if (days < 0) return `Venció hace ${Math.abs(days)} d`; if (days === 0) return 'Vence hoy'; return `Vence en ${days} d`; }
  private daysUntil(value: string) { const normalized = value.includes('/') ? value.split('/').reverse().join('-') : value; const target = new Date(`${normalized}T12:00:00`); const today = new Date(); today.setHours(0,0,0,0); return Math.round((target.getTime() - today.getTime()) / 86400000); }
}
