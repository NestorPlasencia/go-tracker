const MAP_BOUNDS = L.latLngBounds(
  [38.90365, -77.04184],
  [38.91126, -77.02946],
);

const EVENT_NODES = [
  {
    id: "whole-foods",
    name: "Whole foods",
    coordinates: [38.909376791183966, -77.03395139898984],
  },
  {
    id: "wawa",
    name: "Wawa",
    coordinates: [38.90538761236542, -77.03249100401345],
  },
  {
    id: "home",
    name: "Home",
    coordinates: [38.90657431085857, -77.03554899423554],
  },
  {
    id: "embassy",
    name: "Embassy",
    coordinates: [38.90775958187091, -77.03872911695505],
  },
  
];

const map = L.map("map", {
  attributionControl: false,
  maxBounds: MAP_BOUNDS.pad(0.15),
  maxBoundsViscosity: 0.8,
  minZoom: 15,
  maxZoom: 20,
  zoomControl: true,
});

map.createPane("baseImage");
map.getPane("baseImage").style.zIndex = 200;
map.getPane("baseImage").style.pointerEvents = "none";

L.imageOverlay("map.webp", MAP_BOUNDS, {
  pane: "baseImage",
  alt: "Mapa del área del evento basado en OpenStreetMap",
  interactive: false,
}).addTo(map);

L.control
  .attribution({ prefix: false, position: "bottomleft" })
  .addAttribution(
    '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>',
  )
  .addTo(map);

map.fitBounds(MAP_BOUNDS, { animate: false, padding: [12, 12] });

L.rectangle(MAP_BOUNDS, {
  color: "#2f5e46",
  weight: 1,
  opacity: 0.45,
  fill: false,
  interactive: false,
}).addTo(map);

map.createPane("walkways");
map.getPane("walkways").style.zIndex = 350;
map.getPane("walkways").style.pointerEvents = "none";

function walkwayStyle(feature) {
  const { highway, footway } = feature.properties || {};

  if (footway === "crossing") {
    return {
      color: "#1976d2",
      weight: 2,
      opacity: 0.32,
      dashArray: "5 5",
    };
  }

  if (highway === "steps") {
    return {
      color: "#bc4734",
      weight: 2,
      opacity: 0.38,
      dashArray: "2 4",
    };
  }

  if (footway === "traffic_island") {
    return {
      color: "#b7872f",
      weight: 2,
      opacity: 0.32,
    };
  }

  return {
    color: footway === "sidewalk" ? "#23845d" : "#52665b",
    weight: footway === "sidewalk" ? 1.8 : 1.5,
    opacity: 0.28,
  };
}

const crossingPointsLayer = L.geoJSON(null, {
  pane: "walkways",
  filter: (feature) => feature.geometry?.type === "Point",
  pointToLayer: (_feature, latlng) =>
    L.circleMarker(latlng, {
      pane: "walkways",
      radius: 2.5,
      color: "#fff",
      weight: 1,
      fillColor: "#1976d2",
      opacity: 0.45,
      fillOpacity: 0.35,
    }),
});

function updateCrossingPointVisibility() {
  const shouldShow = map.getZoom() >= 18;
  const isVisible = map.hasLayer(crossingPointsLayer);

  if (shouldShow && !isVisible) {
    crossingPointsLayer.addTo(map);
  } else if (!shouldShow && isVisible) {
    crossingPointsLayer.removeFrom(map);
  }
}

class MinHeap {
  constructor() {
    this.items = [];
  }

  push(key, priority) {
    const item = { key, priority };
    this.items.push(item);
    let index = this.items.length - 1;

    while (index > 0) {
      const parent = Math.floor((index - 1) / 2);
      if (this.items[parent].priority <= item.priority) break;
      this.items[index] = this.items[parent];
      index = parent;
    }

    this.items[index] = item;
  }

  pop() {
    if (this.items.length === 0) return undefined;
    const first = this.items[0];
    const last = this.items.pop();

    if (this.items.length > 0) {
      let index = 0;
      this.items[0] = last;

      while (true) {
        const left = index * 2 + 1;
        const right = left + 1;
        let smallest = index;

        if (
          left < this.items.length &&
          this.items[left].priority < this.items[smallest].priority
        ) {
          smallest = left;
        }

        if (
          right < this.items.length &&
          this.items[right].priority < this.items[smallest].priority
        ) {
          smallest = right;
        }

        if (smallest === index) break;
        [this.items[index], this.items[smallest]] = [
          this.items[smallest],
          this.items[index],
        ];
        index = smallest;
      }
    }

    return first;
  }

  get size() {
    return this.items.length;
  }
}

function isWalkableLine(feature) {
  if (feature.geometry?.type !== "LineString") return false;
  const { highway, footway } = feature.properties || {};
  return (
    ["footway", "pedestrian", "path", "steps", "corridor"].includes(highway) ||
    ["sidewalk", "crossing", "traffic_island"].includes(footway)
  );
}

function buildWalkingGraph(data) {
  const nodes = new Map();

  function getNode(coordinate) {
    const [longitude, latitude] = coordinate;
    const key = `${longitude.toFixed(7)},${latitude.toFixed(7)}`;

    if (!nodes.has(key)) {
      nodes.set(key, {
        key,
        latlng: L.latLng(latitude, longitude),
        edges: new Map(),
        component: undefined,
      });
    }

    return nodes.get(key);
  }

  data.features.filter(isWalkableLine).forEach((feature) => {
    const coordinates = feature.geometry.coordinates;

    for (let index = 1; index < coordinates.length; index += 1) {
      const start = getNode(coordinates[index - 1]);
      const end = getNode(coordinates[index]);
      const distance = start.latlng.distanceTo(end.latlng);

      if (distance <= 0) continue;
      if (!start.edges.has(end.key) || start.edges.get(end.key) > distance) {
        start.edges.set(end.key, distance);
        end.edges.set(start.key, distance);
      }
    }
  });

  let componentCount = 0;
  nodes.forEach((node) => {
    if (node.component !== undefined) return;

    const queue = [node];
    node.component = componentCount;

    for (let index = 0; index < queue.length; index += 1) {
      const current = queue[index];
      current.edges.forEach((_distance, neighborKey) => {
        const neighbor = nodes.get(neighborKey);
        if (neighbor.component === undefined) {
          neighbor.component = componentCount;
          queue.push(neighbor);
        }
      });
    }

    componentCount += 1;
  });

  return { nodes, componentCount };
}

function findBestSnapPair(graph, origin, destination) {
  const candidates = new Map();

  graph.nodes.forEach((node) => {
    if (!candidates.has(node.component)) {
      candidates.set(node.component, {
        startNode: undefined,
        startDistance: Infinity,
        endNode: undefined,
        endDistance: Infinity,
      });
    }

    const candidate = candidates.get(node.component);
    const startDistance = origin.distanceTo(node.latlng);
    const endDistance = destination.distanceTo(node.latlng);

    if (startDistance < candidate.startDistance) {
      candidate.startDistance = startDistance;
      candidate.startNode = node;
    }

    if (endDistance < candidate.endDistance) {
      candidate.endDistance = endDistance;
      candidate.endNode = node;
    }
  });

  let best;
  candidates.forEach((candidate) => {
    const score = candidate.startDistance + candidate.endDistance;
    if (!best || score < best.score) {
      best = { ...candidate, score };
    }
  });

  return best;
}

function findShortestPath(graph, startKey, endKey) {
  const distances = new Map([[startKey, 0]]);
  const previous = new Map();
  const heap = new MinHeap();
  heap.push(startKey, 0);

  while (heap.size > 0) {
    const current = heap.pop();
    if (current.priority !== distances.get(current.key)) continue;
    if (current.key === endKey) break;

    graph.nodes.get(current.key).edges.forEach((weight, neighborKey) => {
      const nextDistance = current.priority + weight;
      if (nextDistance < (distances.get(neighborKey) ?? Infinity)) {
        distances.set(neighborKey, nextDistance);
        previous.set(neighborKey, current.key);
        heap.push(neighborKey, nextDistance);
      }
    });
  }

  if (!distances.has(endKey)) return undefined;

  const path = [];
  let key = endKey;
  while (key !== undefined) {
    path.push(graph.nodes.get(key).latlng);
    if (key === startKey) break;
    key = previous.get(key);
  }

  path.reverse();
  return { path, distance: distances.get(endKey) };
}

let walkingGraph;
let graphLoadError;

fetch("walkways-osm.geojson")
  .then((response) => {
    if (!response.ok) {
      throw new Error(`No se pudo cargar el GeoJSON (${response.status})`);
    }
    return response.json();
  })
  .then((data) => {
    walkingGraph = buildWalkingGraph(data);

    L.geoJSON(data, {
      pane: "walkways",
      filter: (feature) => feature.geometry?.type !== "Point",
      style: walkwayStyle,
    }).addTo(map);

    crossingPointsLayer.addData(data);
    updateCrossingPointVisibility();

    if (pendingRouteNode && userCoordinates) {
      calculateWalkingRoute(pendingRouteNode);
    } else {
      routeSummary.textContent = `Red lista: ${walkingGraph.nodes.size.toLocaleString("es")} puntos transitables.`;
    }
  })
  .catch((error) => {
    console.error(error);
    graphLoadError = error;
    routeSummary.textContent = "No se pudo cargar la red peatonal.";
  });

map.on("zoomend", updateCrossingPointVisibility);

const walkwayLegend = L.control({ position: "bottomleft" });
walkwayLegend.onAdd = () => {
  const container = L.DomUtil.create("div", "walkway-legend");
  container.innerHTML = `
    <strong>Red peatonal</strong>
    <span><i class="walkway-legend__line walkway-legend__line--sidewalk"></i>Aceras</span>
    <span><i class="walkway-legend__line walkway-legend__line--crossing"></i>Cruces</span>
    <span><i class="walkway-legend__line walkway-legend__line--steps"></i>Escaleras</span>
  `;
  return container;
};
walkwayLegend.addTo(map);

function createNodeIcon(number) {
  return L.divIcon({
    className: "event-node-marker",
    html: `<span class="event-node-marker__pulse"></span><span class="event-node-marker__core">${number}</span>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22],
  });
}

EVENT_NODES.forEach((node, index) => {
  const nodeNumber = index + 1;
  const marker = L.marker(node.coordinates, {
    icon: createNodeIcon(nodeNumber),
    title: node.name,
    alt: `Nodo ${node.name}`,
    keyboard: true,
  }).addTo(map);

  marker.bindTooltip(node.name, {
    permanent: true,
    direction: "top",
    offset: [0, -20],
    className: "event-node-label",
  });

  marker.bindPopup(`
    <article class="node-popup">
      <span>Nodo ${nodeNumber}</span>
      <strong>${node.name}</strong>
      <small>${node.coordinates[0].toFixed(6)}, ${node.coordinates[1].toFixed(6)}</small>
    </article>
  `);
});

const locationStatusDot = document.querySelector("#location-status-dot");
const locationStatusTitle = document.querySelector("#location-status-title");
const locationStatusMessage = document.querySelector("#location-status-message");
const routeButtons = document.querySelector("#route-buttons");
const routeSummary = document.querySelector("#route-summary");
const mapModal = document.querySelector("#map-modal");
const mapModalTitle = document.querySelector("#map-modal-title");
const closeMapButton = document.querySelector("#close-map-button");
const locationLoading = document.querySelector("#location-loading");
const googleMapsLink = document.querySelector("#google-maps-link");
const appleMapsLink = document.querySelector("#apple-maps-link");
const externalMapActions = document.querySelector("#external-map-actions");
const homeMain = document.querySelector(".home-main");
const homeTopbar = document.querySelector(".home-topbar");

let userLocationMarker;
let userCoordinates;
let activeRoute;
let pendingRouteNode;
let lastFocusedRouteButton;
let activeDestinationNode;
let locationWatchId;
let lastRouteOrigin;

const userLocationIcon = L.divIcon({
  className: "user-location-marker",
  html: '<span class="user-location-marker__dot"></span>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function updateLocationStatus(type, title, message) {
  locationStatusDot.classList.toggle("is-idle", type === "idle");
  locationStatusDot.classList.toggle("is-loading", type === "loading");
  locationStatusDot.classList.toggle("is-error", type === "error");
  locationStatusTitle.textContent = title;
  locationStatusMessage.textContent = message;
}

function setLocationLoading(isLoading) {
  locationLoading.classList.toggle("is-visible", isLoading);
}

function showUserLocation(position) {
  const { latitude, longitude, accuracy } = position.coords;
  const coordinates = L.latLng(latitude, longitude);
  userCoordinates = coordinates;
  setLocationLoading(false);

  if (activeDestinationNode) {
    updateExternalMapLinks(activeDestinationNode);
  }

  if (!userLocationMarker) {
    userLocationMarker = L.marker(coordinates, {
      icon: userLocationIcon,
      title: "Tu ubicación",
      alt: "Tu ubicación actual",
      zIndexOffset: 1000,
    })
      .bindPopup("<strong>Tu ubicación actual</strong>")
      .addTo(map);
  } else {
    userLocationMarker.setLatLng(coordinates);
  }

  const isInsideEvent = MAP_BOUNDS.contains(coordinates);
  const accuracyLabel = Math.round(accuracy);

  updateLocationStatus(
    isInsideEvent ? "success" : "error",
    isInsideEvent ? "Seguimiento GPS activo" : "Estás fuera del área del evento",
    isInsideEvent
      ? `Precisión aproximada: ${accuracyLabel} m.`
      : `Usa Google Maps o Apple Maps para llegar. Precisión: ${accuracyLabel} m.`,
  );
  externalMapActions.classList.toggle("is-recommended", !isInsideEvent);

  if (isInsideEvent) {
    map.setView(coordinates, Math.max(map.getZoom(), 18), { animate: true });
  } else {
    map.fitBounds(L.latLngBounds([coordinates, MAP_BOUNDS.getCenter()]), {
      padding: [50, 50],
      maxZoom: 15,
    });
  }

  if (pendingRouteNode) {
    calculateWalkingRoute(pendingRouteNode);
  } else if (
    activeDestinationNode &&
    mapModal.classList.contains("is-open")
  ) {
    const movementThreshold = Math.max(10, Math.min(50, accuracy));
    if (
      !lastRouteOrigin ||
      lastRouteOrigin.distanceTo(coordinates) >= movementThreshold
    ) {
      calculateWalkingRoute(activeDestinationNode, { fitMap: false });
    }
  }
}

function stopLocationTracking() {
  if (locationWatchId !== undefined && navigator.geolocation) {
    navigator.geolocation.clearWatch(locationWatchId);
  }
  locationWatchId = undefined;
}

function handleLocationError(error) {
  const messages = {
    1: "El permiso fue rechazado. Habilita la ubicación en los ajustes del navegador.",
    2: "El dispositivo no pudo determinar tu ubicación.",
    3: "La solicitud tardó demasiado. Inténtalo nuevamente.",
  };

  setLocationLoading(false);

  if (error.code === 1) {
    stopLocationTracking();
  }

  updateLocationStatus(
    "error",
    "No pudimos obtener tu ubicación",
    messages[error.code] || "Ocurrió un error al consultar la ubicación.",
  );

  if (pendingRouteNode) {
    routeSummary.textContent = messages[error.code] || "No se pudo obtener tu ubicación.";
  }
}

function requestUserLocation(options = {}) {
  const showLoader = options.showLoader ?? true;

  if (!navigator.geolocation) {
    setLocationLoading(false);
    updateLocationStatus(
      "error",
      "Ubicación no disponible",
      "Este navegador no admite geolocalización.",
    );
    return;
  }

  stopLocationTracking();
  setLocationLoading(showLoader);
  updateLocationStatus(
    "loading",
    "Solicitando tu ubicación…",
    "Acepta el permiso del navegador para mostrar tu posición.",
  );

  locationWatchId = navigator.geolocation.watchPosition(
    showUserLocation,
    handleLocationError,
    {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 20000,
    },
  );
}

function calculateWalkingRoute(node, options = {}) {
  const fitMap = options.fitMap ?? true;
  pendingRouteNode = node;

  if (!userCoordinates) {
    routeSummary.textContent = `Obteniendo tu ubicación para calcular la ruta a ${node.name}…`;
    requestUserLocation();
    return;
  }

  if (!MAP_BOUNDS.contains(userCoordinates)) {
    if (activeRoute) {
      activeRoute.remove();
      activeRoute = undefined;
    }
    externalMapActions.classList.add("is-recommended");
    routeSummary.textContent = `Estás fuera del área del evento. Usa Google Maps o Apple Maps para llegar a ${node.name}.`;
    return;
  }

  externalMapActions.classList.remove("is-recommended");

  if (graphLoadError) {
    routeSummary.textContent = "La red peatonal no está disponible. Recarga la página e inténtalo otra vez.";
    return;
  }

  if (!walkingGraph) {
    routeSummary.textContent = "Preparando la red peatonal…";
    return;
  }

  const destination = L.latLng(node.coordinates);
  const snapPair = findBestSnapPair(walkingGraph, userCoordinates, destination);
  const result = findShortestPath(
    walkingGraph,
    snapPair.startNode.key,
    snapPair.endNode.key,
  );

  if (!result) {
    routeSummary.textContent = `No se encontró una conexión peatonal hasta ${node.name}.`;
    return;
  }

  if (activeRoute) {
    activeRoute.remove();
  }

  const routeLayers = [];
  const connectorStyle = {
    color: "#1976d2",
    weight: 3,
    opacity: 0.75,
    dashArray: "3 8",
    lineCap: "round",
    interactive: false,
  };

  if (snapPair.startDistance > 1) {
    routeLayers.push(
      L.polyline([userCoordinates, snapPair.startNode.latlng], connectorStyle),
    );
  }

  if (result.path.length > 1) {
    routeLayers.push(
      L.polyline(result.path, {
        color: "#fff",
        weight: 10,
        opacity: 0.92,
        lineCap: "round",
        lineJoin: "round",
        interactive: false,
      }),
    );

    routeLayers.push(
      L.polyline(result.path, {
        color: "#1976d2",
        weight: 6.5,
        opacity: 1,
        lineCap: "round",
        lineJoin: "round",
        interactive: false,
      }),
    );
  }

  if (snapPair.endDistance > 1) {
    routeLayers.push(
      L.polyline([snapPair.endNode.latlng, destination], connectorStyle),
    );
  }

  activeRoute = L.featureGroup(routeLayers).addTo(map);
  pendingRouteNode = undefined;
  lastRouteOrigin = L.latLng(userCoordinates.lat, userCoordinates.lng);

  document.querySelectorAll(".route-button").forEach((button) => {
    const isActive = button.dataset.nodeId === node.id;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const distanceMeters = Math.round(
    result.distance + snapPair.startDistance + snapPair.endDistance,
  );
  const walkingMinutes = Math.max(1, Math.ceil(distanceMeters / 80));
  routeSummary.textContent = `Ruta a ${node.name}: ${distanceMeters} m · ${walkingMinutes} min aprox. Los extremos punteados conectan con la acera.`;
  if (fitMap && activeRoute.getBounds().isValid()) {
    map.fitBounds(activeRoute.getBounds(), {
      padding: [70, 70],
      maxZoom: 18,
    });
  }
}

function updateExternalMapLinks(node) {
  const [latitude, longitude] = node.coordinates;
  const destination = encodeURIComponent(`${latitude},${longitude}`);

  googleMapsLink.href = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=walking`;
  googleMapsLink.setAttribute("aria-label", `Abrir ruta a ${node.name} en Google Maps`);

  if (userCoordinates) {
    const source = encodeURIComponent(`${userCoordinates.lat},${userCoordinates.lng}`);
    appleMapsLink.href = `https://maps.apple.com/directions?source=${source}&destination=${destination}&mode=walking`;
    appleMapsLink.classList.remove("is-disabled");
    appleMapsLink.setAttribute("aria-disabled", "false");
    appleMapsLink.setAttribute("aria-label", `Abrir ruta a ${node.name} en Apple Maps`);
    appleMapsLink.tabIndex = 0;
  } else {
    appleMapsLink.removeAttribute("href");
    appleMapsLink.classList.add("is-disabled");
    appleMapsLink.setAttribute("aria-disabled", "true");
    appleMapsLink.setAttribute("aria-label", "Apple Maps estará disponible al obtener tu ubicación");
    appleMapsLink.tabIndex = -1;
  }
}

function openMapModal(node, triggerButton) {
  lastFocusedRouteButton = triggerButton;
  activeDestinationNode = node;
  mapModalTitle.textContent = node.name;
  updateExternalMapLinks(node);
  mapModal.classList.add("is-open");
  mapModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  homeMain.inert = true;
  homeTopbar.inert = true;

  requestAnimationFrame(() => {
    map.invalidateSize({ animate: false });
    calculateWalkingRoute(node);
    if (userCoordinates && locationWatchId === undefined) {
      requestUserLocation({ showLoader: false });
    }
    closeMapButton.focus();
  });
}

function closeMapModal() {
  stopLocationTracking();
  setLocationLoading(false);
  mapModal.classList.remove("is-open");
  mapModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  homeMain.inert = false;
  homeTopbar.inert = false;
  lastFocusedRouteButton?.focus();
}

EVENT_NODES.forEach((node, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "route-button";
  button.dataset.nodeId = node.id;
  button.setAttribute("aria-pressed", "false");
  button.innerHTML = `
    <span class="route-button__number">${index + 1}</span>
    <span>${node.name}</span>
  `;
  button.addEventListener("click", () => openMapModal(node, button));
  routeButtons.append(button);
});

closeMapButton.addEventListener("click", closeMapModal);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mapModal.classList.contains("is-open")) {
    closeMapModal();
  }
});
