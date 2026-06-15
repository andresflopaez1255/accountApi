## Bot Codex

Modulo para registrar cuentas de streaming en Firebase.

### Servicios soportados

- Netflix
- Amazon
- Disney
- Crunchyroll

### Casos soportados

- Cuenta completa
- Perfil especifico

### Uso rapido

```ts
import { registerStreamingAccountFromText } from './index';

const result = await registerStreamingAccountFromText(`
servicio: netflix
tipo: cuenta
cliente: Juan Perez
telefono: 3001234567
correo_cliente: juan@email.com
correo_cuenta: cuenta@stream.com
clave: 123456
vence: 26/12/2025
`);
```

### Uso local con Telegram

- Define `TELEGRAM_BOT_TOKEN` en tu `.env`.
- Opcional: define `TELEGRAM_BOT_MODE=polling` para forzar modo local.
- Levanta el proyecto con `npm run dev`.
- En Telegram usa `/start`, `/ayuda`, `/crear_cuenta`, `/buscar_cuentas`, `/actualizar_cuenta`, `/garantia`, `/proximos_vencer` o pega directamente una plantilla.
- Si pegas una plantilla corta como `correo/contraseña/perfil/pin/vence`, el bot la organiza y luego te pide solo `servicio`, `tipo` y `cliente`.
- Si el cliente no existe, el bot te pide solo el teléfono para crearlo.

### Notas

- Si el usuario no existe, se crea en la coleccion `users`.
- Si la categoria no existe, se crea en `categories_account`.
- Si ya existe una cuenta con el mismo `correo_cuenta`, servicio y perfil, se actualiza.
