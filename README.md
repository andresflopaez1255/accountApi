# Account API

API en TypeScript para gestionar clientes, cuentas de streaming, categorías y vendedores. La persistencia se realiza exclusivamente con Firebase Firestore.

## Configuración

1. Copia `.env.example` a `.env` y completa las variables.
2. Proporciona una cuenta de servicio de Firebase mediante `FIREBASE_CONFIG`, `FIREBASE_SERVICE_ACCOUNT_PATH`, `FIREBASE_SERVICE_ACCOUNT_JSON` o `GOOGLE_APPLICATION_CREDENTIALS`.
3. Instala dependencias con `npm install` y ejecuta `npm run dev`.

`JWT_SECRET` es obligatorio para iniciar sesión y consumir las rutas de negocio. Genera un valor aleatorio largo; nunca lo subas al repositorio. El bot es opcional y solo se inicia si `BOT_TOKEN` está configurado. Para usar webhooks, establece también `BOT_WEBHOOK_URL`.

## Autenticación

`POST /sign_in_vendors` registra vendedores en Firestore, con contraseña cifrada mediante bcrypt. Por seguridad se encuentra deshabilitado salvo que se configure `ALLOW_VENDOR_REGISTRATION=true` durante el alta inicial. `POST /log_in_vendors` devuelve un JWT de 8 horas. Envía ese token en las rutas de negocio:

`Authorization: Bearer <token>`

Las rutas de clientes, cuentas y categorías requieren autenticación. Las contraseñas de cuentas de streaming son sensibles: la API solo debe desplegarse bajo HTTPS y accederse por vendedores autorizados.

## Rutas principales

- Clientes: `/users`, `/new_user`, `/update_user`, `/delete_user`, `/search_user`
- Cuentas: `/accounts`, `/new_account`, `/update_account`, `/delete_account`, `/search_account`
- Categorías Firestore: `/categories`, `/new_category`, `/update_category`, `/delete_category`
- Vendedores: `/sign_in_vendors`, `/log_in_vendors`

Las mutaciones reciben JSON. Los IDs de Firestore y los IDs de negocio se mantienen alineados para que actualizar y eliminar sea consistente; la API conserva compatibilidad de lectura con documentos antiguos que tengan IDs internos distintos.
