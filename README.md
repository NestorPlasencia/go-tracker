# Event Walkway Navigator

Mapa peatonal móvil para navegar entre los nodos de un evento. Utiliza la ubicación del dispositivo, una red local de aceras en GeoJSON y cálculo de rutas en el navegador.

## Funcionamiento local

El proyecto es un sitio estático. Debe abrirse mediante un servidor HTTP; no funciona correctamente abriendo `index.html` directamente como archivo.

```powershell
python -m http.server 8080 --bind 127.0.0.1
```

Luego abre `http://127.0.0.1:8080`.

## Despliegue GitHub → Vercel

1. Crea un repositorio vacío en GitHub.
2. Publica el contenido de este proyecto en la rama `main`.
3. En Vercel, selecciona **Add New → Project** e importa el repositorio.
4. Usa **Framework Preset: Other**.
5. Deja vacíos **Build Command** y **Output Directory**.
6. Pulsa **Deploy**.

Vercel servirá el sitio mediante HTTPS, requisito necesario para solicitar la ubicación GPS en navegadores móviles.

## Archivos cartográficos

- `map.webp`: mapa base estático.
- `walkways-osm.geojson`: aceras, cruces y caminos peatonales.
- `app.js`: nodos, seguimiento GPS y cálculo de rutas.

Los datos y el mapa derivados de OpenStreetMap deben conservar la atribución visible a OpenStreetMap contributors.
