# Proyecto Frontend - Cine App (Angular)

Este proyecto es el frontend de la aplicación de gestión de películas y turnos de cine usando Angular.

## Requisitos

- Node.js >= 18.x
- npm >= 9.x o yarn >= 1.x
- Angular CLI >= 16.x
- Navegador moderno (Chrome, Edge, Firefox)

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/joehhhh11/sirena-front
cd cine-frontend
```

2. Instalar dependencias:

```bash
npm install
# o con yarn
# yarn install
```

3. Ejecutar la aplicación en modo desarrollo:

```bash
ng serve
```

Por defecto, la aplicación se servirá en `http://localhost:4200/`.

## Variables de Entorno

Crear un archivo `src/environments/environment.ts` para desarrollo:

```ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api',
};
```

Y para producción `src/environments/environment.prod.ts`:

```ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://mi-dominio.com/api',
};
```

> Nota: `apiBaseUrl` se usa para todas las llamadas a la API.

## Estructura del Proyecto

```
src/
├─ app/
│  ├─ components/      # Componentes reutilizables
│  ├─ pages/           # Páginas o vistas principales
│  ├─ services/        # Servicios para consumir la API
│  ├─ app.module.ts    # Módulo raíz
│  └─ app.component.*  # Componente raíz
├─ assets/             # Imágenes, iconos, estilos
├─ environments/       # Configuración de entornos
```



## Scripts Útiles

```bash
# Ejecutar la app en modo desarrollo
ng serve


