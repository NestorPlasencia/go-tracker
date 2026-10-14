const demoSelect = document.querySelector("#demo-select");
const walkwayTypeSelect = document.querySelector("#walkway-type");
const subdivisionCountInput = document.querySelector("#subdivision-count");
const existingNodesToggle = document.querySelector("#existing-nodes-toggle");
const drawButton = document.querySelector("#draw-button");
const editButton = document.querySelector("#edit-button");
const splitButton = document.querySelector("#split-button");
const removeButton = document.querySelector("#remove-button");
const exportButton = document.querySelector("#export-button");
const embedExportButton = document.querySelector("#embed-export-button");
const statusElement = document.querySelector("#editor-status");
const openDemoLink = document.querySelector("#open-demo-link");

const PUBLIC_APP_URL = "https://go-tracker-ten.vercel.app/";

let manifest;
let activeDemo;
let map;
let baseImageLayer;
let boundsLayer;
let editableLayers;
let referenceLayers;
let existingNodesLayer;
let existingNodesRenderer;
let preservedFeatures = [];
let splitModeEnabled = false;

function setStatus(message, isError = false) {
  statusElement.textContent = message;
  statusElement.classList.toggle("is-error", isError);
}

function lineStyle(feature) {
  const { highway, footway } = feature?.properties || {};

  if (footway === "crossing") {
    return { color: "#1976d2", weight: 5, dashArray: "6 6", opacity: 0.95 };
  }

  if (highway === "steps") {
    return { color: "#bc4734", weight: 5, dashArray: "3 5", opacity: 0.95 };
  }

  return {
    color: footway === "sidewalk" ? "#23845d" : "#665b48",
    weight: 5,
    opacity: 0.92,
  };
}

function propertiesForType(type) {
  if (type === "crossing") {
    return { highway: "footway", footway: "crossing" };
  }

  if (type === "steps") {
    return { highway: "steps" };
  }

  if (type === "footway") {
    return { highway: "footway" };
  }

  return { highway: "footway", footway: "sidewalk" };
}

function updateModeButtons() {
  editButton.classList.toggle("is-active", Boolean(map?.pm.globalEditModeEnabled()));
  splitButton.classList.toggle("is-active", splitModeEnabled);
  removeButton.classList.toggle("is-active", Boolean(map?.pm.globalRemovalModeEnabled()));
}

function setSplitMode(enabled) {
  splitModeEnabled = enabled;
  document.querySelector("#editor-map").classList.toggle("is-split-mode", enabled);
  updateModeButtons();
}

function disableIndividualEditing() {
  editableLayers?.eachLayer((layer) => layer.pm?.disable());
}

function distanceToSegmentSquared(point, start, end) {
  const segmentX = end.x - start.x;
  const segmentY = end.y - start.y;
  const lengthSquared = segmentX ** 2 + segmentY ** 2;
  if (lengthSquared === 0) return point.distanceTo(start) ** 2;

  const ratio = Math.max(
    0,
    Math.min(
      1,
      ((point.x - start.x) * segmentX + (point.y - start.y) * segmentY) /
        lengthSquared,
    ),
  );
  const closest = L.point(start.x + segmentX * ratio, start.y + segmentY * ratio);
  return point.distanceTo(closest) ** 2;
}

function findClosestEditableLine(latlng, maximumDistance = 24) {
  const target = map.latLngToContainerPoint(latlng);
  let closestLayer;
  let closestDistanceSquared = maximumDistance ** 2;

  editableLayers.eachLayer((layer) => {
    const latlngs = layer.getLatLngs?.();
    if (!Array.isArray(latlngs) || latlngs.length < 2 || Array.isArray(latlngs[0])) {
      return;
    }

    for (let index = 0; index < latlngs.length - 1; index += 1) {
      const distanceSquared = distanceToSegmentSquared(
        target,
        map.latLngToContainerPoint(latlngs[index]),
        map.latLngToContainerPoint(latlngs[index + 1]),
      );

      if (distanceSquared <= closestDistanceSquared) {
        closestDistanceSquared = distanceSquared;
        closestLayer = layer;
      }
    }
  });

  return closestLayer;
}

function handleSubdivisionClick(event) {
  if (!splitModeEnabled) return;

  const layer = findClosestEditableLine(event.latlng);
  if (!layer) {
    setStatus("Toca más cerca de la línea que quieres subdividir.", true);
    return;
  }

  subdivideLine(layer);
}

function createNodesPreservingCorners(latlngs, requestedNodeCount) {
  const originalNodes = latlngs.filter(
    (latlng, index) => index === 0 || latlng.distanceTo(latlngs[index - 1]) > 0.01,
  );
  if (originalNodes.length < 2) return undefined;

  const finalNodeCount = Math.max(requestedNodeCount, originalNodes.length);
  const nodesToAdd = finalNodeCount - originalNodes.length;
  const segments = [];
  let totalDistance = 0;

  for (let index = 0; index < originalNodes.length - 1; index += 1) {
    const length = originalNodes[index].distanceTo(originalNodes[index + 1]);
    segments.push({ index, length, addedNodes: 0, remainder: 0 });
    totalDistance += length;
  }

  if (totalDistance <= 0) return undefined;

  let assignedNodes = 0;
  segments.forEach((segment) => {
    const exactShare = (nodesToAdd * segment.length) / totalDistance;
    segment.addedNodes = Math.floor(exactShare);
    segment.remainder = exactShare - segment.addedNodes;
    assignedNodes += segment.addedNodes;
  });

  segments
    .slice()
    .sort((first, second) => second.remainder - first.remainder)
    .slice(0, nodesToAdd - assignedNodes)
    .forEach((segment) => {
      segment.addedNodes += 1;
    });

  const nodes = [L.latLng(originalNodes[0].lat, originalNodes[0].lng)];

  segments.forEach((segment) => {
    const start = originalNodes[segment.index];
    const end = originalNodes[segment.index + 1];

    for (let offset = 1; offset <= segment.addedNodes; offset += 1) {
      const ratio = offset / (segment.addedNodes + 1);
      nodes.push(
        L.latLng(
          start.lat + (end.lat - start.lat) * ratio,
          start.lng + (end.lng - start.lng) * ratio,
        ),
      );
    }

    nodes.push(L.latLng(end.lat, end.lng));
  });

  return {
    nodes,
    originalNodeCount: originalNodes.length,
    requestedNodeCount,
  };
}

function subdivideLine(layer) {
  const latlngs = layer.getLatLngs();
  if (!Array.isArray(latlngs) || latlngs.length < 2 || Array.isArray(latlngs[0])) {
    setStatus("Esta geometría no se puede subdividir como una línea simple.", true);
    return;
  }

  const nodeCount = Number.parseInt(subdivisionCountInput.value, 10);
  if (!Number.isInteger(nodeCount) || nodeCount < 2 || nodeCount > 100) {
    setStatus("El número de nodos debe estar entre 2 y 100.", true);
    subdivisionCountInput.focus();
    return;
  }

  const subdivision = createNodesPreservingCorners(latlngs, nodeCount);
  if (!subdivision) {
    setStatus("La línea no tiene longitud suficiente para subdividirse.", true);
    return;
  }

  layer.setLatLngs(subdivision.nodes);
  layer.redraw();
  setSplitMode(false);
  layer.pm.enable({
    snappable: true,
    snapDistance: 24,
    allowSelfIntersection: false,
  });

  const actualNodeCount = subdivision.nodes.length;
  setStatus(
    actualNodeCount > nodeCount
      ? `Se conservaron las ${subdivision.originalNodeCount} esquinas originales. La línea tiene ${actualNodeCount} nodos movibles.`
      : `Línea subdividida en ${actualNodeCount} nodos movibles sin alterar sus esquinas.`,
  );
}

function initializeMap(bounds, mapOptions) {
  if (!map) {
    map = L.map("editor-map", {
      minZoom: mapOptions.minZoom ?? 15,
      maxZoom: mapOptions.maxZoom ?? 20,
    });

    editableLayers = L.featureGroup().addTo(map);
    referenceLayers = L.featureGroup().addTo(map);
    map.createPane("existingNodes");
    map.getPane("existingNodes").style.zIndex = 450;
    map.getPane("existingNodes").style.pointerEvents = "none";
    existingNodesRenderer = L.canvas({ pane: "existingNodes", padding: 0.5 });
    existingNodesLayer = L.layerGroup().addTo(map);

    map.pm.setGlobalOptions({
      snappable: true,
      snapDistance: 24,
      finishOn: "dblclick",
      layerGroup: editableLayers,
    });

    map.on("pm:create", ({ layer }) => {
      const properties = propertiesForType(walkwayTypeSelect.value);
      layer.feature = { type: "Feature", properties };
      layer.setStyle(lineStyle(layer.feature));
      editableLayers.addLayer(layer);
      setStatus(`Línea agregada. Total editable: ${editableLayers.getLayers().length}.`);
    });

    map.on("pm:globaleditmodetoggled", updateModeButtons);
    map.on("pm:globalremovalmodetoggled", updateModeButtons);
    map.on("click", handleSubdivisionClick);
  } else {
    map.setMinZoom(mapOptions.minZoom ?? 15);
    map.setMaxZoom(mapOptions.maxZoom ?? 20);
    editableLayers.clearLayers();
    referenceLayers.clearLayers();
    existingNodesLayer.clearLayers();
    baseImageLayer?.remove();
    boundsLayer?.remove();
  }

  map.setMaxBounds(bounds.pad(mapOptions.maxBoundsPadding ?? 0.15));
  map.fitBounds(bounds, { animate: false, padding: [12, 12] });
}

async function loadDemo(demoId) {
  const selectedDemo = manifest.demos.find((demo) => demo.id === demoId);
  if (!selectedDemo) return;

  setStatus("Cargando mapa y red peatonal…");

  try {
    const dataUrl = new URL(`../${selectedDemo.data}`, document.baseURI);
    const dataResponse = await fetch(dataUrl);
    if (!dataResponse.ok) throw new Error(`Demo HTTP ${dataResponse.status}`);

    const data = await dataResponse.json();
    const mapUrl = new URL(data.assets.map, dataUrl).href;
    const walkwaysUrl = new URL(data.assets.walkways, dataUrl).href;
    const bounds = L.latLngBounds(data.bounds.southWest, data.bounds.northEast);
    const mapOptions = data.mapOptions || {};

    initializeMap(bounds, mapOptions);

    baseImageLayer = L.imageOverlay(mapUrl, bounds, {
      alt: data.mapAlt,
      interactive: false,
      pmIgnore: true,
    }).addTo(map);
    baseImageLayer.bringToBack();

    boundsLayer = L.rectangle(bounds, {
      color: "#17231d",
      weight: 1,
      fill: false,
      interactive: false,
      pmIgnore: true,
    }).addTo(map);

    const walkwaysResponse = await fetch(walkwaysUrl);
    if (!walkwaysResponse.ok) {
      throw new Error(`GeoJSON HTTP ${walkwaysResponse.status}`);
    }

    const geojson = await walkwaysResponse.json();
    const existingNodeKeys = new Set();
    geojson.features.forEach((feature) => {
      if (feature.geometry?.type !== "LineString") return;

      feature.geometry.coordinates.forEach(([longitude, latitude]) => {
        const key = `${longitude.toFixed(7)},${latitude.toFixed(7)}`;
        if (existingNodeKeys.has(key)) return;
        existingNodeKeys.add(key);

        L.circleMarker([latitude, longitude], {
          pane: "existingNodes",
          renderer: existingNodesRenderer,
          radius: 2.8,
          color: "#fff",
          weight: 1,
          opacity: 0.85,
          fillColor: "#17231d",
          fillOpacity: 0.72,
          interactive: false,
          pmIgnore: true,
        }).addTo(existingNodesLayer);
      });
    });

    if (existingNodesToggle.checked) {
      existingNodesLayer.addTo(map);
    } else {
      existingNodesLayer.removeFrom(map);
    }

    preservedFeatures = geojson.features.filter(
      (feature) => feature.geometry?.type !== "LineString",
    );

    L.geoJSON(
      {
        type: "FeatureCollection",
        features: geojson.features.filter(
          (feature) => feature.geometry?.type === "LineString",
        ),
      },
      {
        style: lineStyle,
        onEachFeature: (feature, layer) => {
          layer.feature = feature;
          editableLayers.addLayer(layer);
        },
      },
    );

    L.geoJSON(
      { type: "FeatureCollection", features: preservedFeatures },
      {
        pmIgnore: true,
        interactive: false,
        pointToLayer: (_feature, latlng) =>
          L.circleMarker(latlng, {
            radius: 3,
            color: "#1976d2",
            fillOpacity: 0.6,
            pmIgnore: true,
          }),
        style: { color: "#8b8170", weight: 2, opacity: 0.45 },
      },
    ).addTo(referenceLayers);

    activeDemo = { id: demoId, data, dataUrl: dataUrl.href, mapUrl, walkwaysUrl };
    [
      drawButton,
      editButton,
      splitButton,
      removeButton,
      exportButton,
      embedExportButton,
    ].forEach((button) => {
      button.disabled = false;
    });
    openDemoLink.href = `../?demo=${encodeURIComponent(demoId)}&testLocation=1`;
    const url = new URL(window.location.href);
    url.searchParams.set("demo", demoId);
    window.history.replaceState({}, "", url);
    setStatus(
      `Demo cargado: ${editableLayers.getLayers().length} líneas y ${existingNodeKeys.size} nodos existentes.`,
    );
  } catch (error) {
    console.error(error);
    setStatus("No se pudo cargar este demo o su red peatonal.", true);
  }
}

drawButton.addEventListener("click", () => {
  setSplitMode(false);
  disableIndividualEditing();
  map.pm.disableGlobalEditMode();
  map.pm.disableGlobalRemovalMode();
  map.pm.enableDraw("Line", {
    snappable: true,
    snapDistance: 24,
    finishOn: "dblclick",
    templineStyle: lineStyle({
      properties: propertiesForType(walkwayTypeSelect.value),
    }),
    hintlineStyle: { color: "#1976d2", dashArray: "5 5" },
  });
  updateModeButtons();
  setStatus("Modo dibujo activo. Doble clic para terminar la línea.");
});

editButton.addEventListener("click", () => {
  setSplitMode(false);
  map.pm.disableDraw("Line");
  map.pm.disableGlobalRemovalMode();
  map.pm.toggleGlobalEditMode();
  updateModeButtons();
});

splitButton.addEventListener("click", () => {
  map.pm.disableDraw("Line");
  map.pm.disableGlobalEditMode();
  map.pm.disableGlobalRemovalMode();
  disableIndividualEditing();
  setSplitMode(!splitModeEnabled);
  setStatus(
    splitModeEnabled
      ? `Modo subdivisión activo. Toca una línea para crear ${subdivisionCountInput.value} nodos.`
      : "Modo división desactivado.",
  );
});

removeButton.addEventListener("click", () => {
  setSplitMode(false);
  disableIndividualEditing();
  map.pm.disableDraw("Line");
  map.pm.disableGlobalEditMode();
  map.pm.toggleGlobalRemovalMode();
  updateModeButtons();
});

exportButton.addEventListener("click", () => {
  if (!activeDemo) return;

  const editableGeoJson = editableLayers.toGeoJSON();
  const output = {
    type: "FeatureCollection",
    features: [...editableGeoJson.features, ...preservedFeatures],
  };
  const blob = new Blob([JSON.stringify(output, null, 2)], {
    type: "application/geo+json",
  });
  const downloadUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = downloadUrl;
  anchor.download = "walkways-osm.json";
  anchor.click();
  URL.revokeObjectURL(downloadUrl);
  setStatus(`Archivo exportado con ${output.features.length} elementos.`);
});

embedExportButton.addEventListener("click", async () => {
  if (!activeDemo) return;

  embedExportButton.disabled = true;

  const demoUrl = new URL(PUBLIC_APP_URL);
  demoUrl.searchParams.set("demo", activeDemo.id);
  demoUrl.searchParams.set("embed", "1");
  const title = `Mapa peatonal de ${activeDemo.data.place || activeDemo.id}`.replace(
    /[&"<]/g,
    (character) => ({ "&": "&amp;", '"': "&quot;", "<": "&lt;" })[character],
  );
  const embedCode = `<iframe
  src="${demoUrl.href}"
  title="${title}"
  width="100%"
  height="480"
  style="border: 0"
  loading="lazy"
  allow="geolocation"
></iframe>`;

  try {
    try {
      await navigator.clipboard.writeText(embedCode);
      setStatus("Código embed copiado. Pégalo en el bloque HTML/Embed de tu sitio.");
    } catch (error) {
      console.error(error);
      const blob = new Blob([embedCode], { type: "text/plain;charset=utf-8" });
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = `${activeDemo.id}-vercel-embed.txt`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
      setStatus("No se pudo copiar el código; descargué un archivo TXT con el embed.");
    }
  } finally {
    embedExportButton.disabled = false;
  }
});

demoSelect.addEventListener("change", () => loadDemo(demoSelect.value));
existingNodesToggle.addEventListener("change", () => {
  if (!map || !existingNodesLayer) return;

  if (existingNodesToggle.checked) {
    existingNodesLayer.addTo(map);
  } else {
    existingNodesLayer.removeFrom(map);
  }
});

(async function initializeEditor() {
  try {
    const response = await fetch("../demos/manifest.json");
    if (!response.ok) throw new Error(`Manifest HTTP ${response.status}`);
    manifest = await response.json();

    manifest.demos.forEach((demo) => {
      const option = document.createElement("option");
      option.value = demo.id;
      option.textContent = demo.name;
      demoSelect.append(option);
    });

    const requestedDemo = new URLSearchParams(window.location.search).get("demo");
    const initialDemo = manifest.demos.some((demo) => demo.id === requestedDemo)
      ? requestedDemo
      : manifest.defaultDemo;
    demoSelect.value = initialDemo;
    await loadDemo(initialDemo);
  } catch (error) {
    console.error(error);
    setStatus("No se pudo iniciar el editor.", true);
  }
})();
