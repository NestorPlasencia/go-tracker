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

## Estructura modular de demos

El motor compartido vive en `app.js`. El demo activo se selecciona con el
parámetro `demo`, por ejemplo:

```text
https://tu-dominio.vercel.app/?demo=washington-dc
```

El encabezado del home también incluye un selector pequeño que se alimenta de
`demos/manifest.json` para cambiar entre todos los demos registrados.

Para probar rutas sin depender del GPS, agrega `testLocation=1`. La ubicación
simulada será el centro de los límites configurados para el demo:

```text
http://127.0.0.1:8080/?demo=washington-dc&testLocation=1
```

Cada demo mantiene sus datos y recursos dentro de su propia carpeta:

```text
demos/
  manifest.json
  washington-dc/
    data.json
    map.webp
    walkways-osm.json
```

- `data.json`: nombre, límites, niveles de zoom, nodos y rutas de los recursos.
- `map.webp`: imagen del mapa base correspondiente a esos límites.
- `walkways-osm.json`: aceras, cruces y caminos peatonales en GeoJSON.
- `demos/manifest.json`: demos disponibles y demo predeterminado.

Para crear otro demo, copia la carpeta `washington-dc`, reemplaza sus tres
archivos y registra el nuevo `id` y la ruta a su `data.json` en el manifiesto.
No es necesario duplicar ni modificar `index.html` o `app.js`.

## Editor de red peatonal

Los archivos de edición están aislados dentro de `editor/` y no son cargados
por la aplicación de navegación. Para abrir la herramienta local:

```text
http://127.0.0.1:8080/editor/?demo=washington-dc
```

El editor permite dibujar, conectar, editar, subdividir y eliminar líneas. La
subdivisión usa 10 nodos movibles por defecto y siempre conserva las esquinas
originales; si una línea ya tiene más vértices, no los elimina. El botón
**Descargar GeoJSON** genera un nuevo `walkways-osm.json`; reemplaza manualmente
el archivo correspondiente dentro de la carpeta del demo después de revisarlo.

Los datos y el mapa derivados de OpenStreetMap deben conservar la atribución visible a OpenStreetMap contributors.
