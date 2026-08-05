# Streamline Admin

Panel Angular mobile-first para la gestión de cuentas de streaming. Los colores de marca se centralizan en `src/styles.css` (variables `--brand-*`) y `tailwind.config.js`.

## Ejecutar

```bash
cd web
npm install
npm start
```

Por defecto la aplicación consume `http://localhost:4000`. Para otro entorno, antes de cargar la aplicación defina `window.__API_URL__` en un archivo JavaScript incluido por el host, o sustituya la constante documentada en `src/app/api.service.ts`.

El panel lee los endpoints existentes `/users`, `/accounts` y `/categories`; la creación/edición se puede añadir al completar la capa autenticada de la API.
