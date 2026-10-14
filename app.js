const DEMO_CONFIG = window.ACTIVE_DEMO;
const APP_ROOT = DEMO_CONFIG.root || document;
const APP_HOST = APP_ROOT.host || document.body;
const SUPPORTED_LANGUAGES = ["es", "en", "pt", "fr"];
const SEARCH_PARAMS = new URLSearchParams(window.location.search);
const REQUESTED_LANGUAGE = SEARCH_PARAMS.get("lang")?.toLowerCase().split("-")[0];
const DEMO_LANGUAGE = (DEMO_CONFIG.locale || "es").toLowerCase().split("-")[0];
const LANGUAGE = SUPPORTED_LANGUAGES.includes(REQUESTED_LANGUAGE)
  ? REQUESTED_LANGUAGE
  : SUPPORTED_LANGUAGES.includes(DEMO_LANGUAGE)
    ? DEMO_LANGUAGE
    : "es";
const MESSAGES = {
  es: {
    pageTitle: "Mapa del evento",
    loadingDemo: "Cargando demo…",
    eventEyebrow: "Navegación del evento",
    appTitle: "Encuentra tu destino",
    demoSelectorAria: "Seleccionar otro demo",
    destinationsAria: "Destinos disponibles",
    destinationSingular: "destino",
    destinationPlural: "destinos",
    footerRoutes: "Rutas peatonales",
    footerGps: "GPS en tiempo real",
    embedTitle: "Configuración del iframe",
    embedDescription: "Elige la ubicación que usarán las rutas al abrir el embed.",
    testLocation: "Usar ubicación de prueba",
    copyEmbed: "Copy to embed",
    copySuccess: "Iframe copiado. Pégalo en el bloque HTML/Embed de tu sitio.",
    copyFallback: "No se pudo copiar; descargué un archivo TXT con el iframe.",
    selectedRoute: "Ruta seleccionada",
    routeSummaryLoading: "Preparando la red peatonal…",
    closeMap: "Cerrar",
    mapAria: "Mapa interactivo del área del evento",
    externalMapAria: "Abrir ruta en otra aplicación",
    continueRoute: "Continuar ruta en",
    locationNotRequested: "Ubicación aún no solicitada",
    locationRequestIntro: "La pediremos para calcular la ruta.",
    loadingLocationTitle: "Obteniendo tu ubicación",
    loadingLocationMessage: "Esto puede tardar unos segundos…",
    mapAlt: "Mapa del área del evento basado en OpenStreetMap",
    networkReady: "Red lista: {count} puntos transitables.",
    networkLoadError: "No se pudo cargar la red peatonal.",
    legendTitle: "Red peatonal",
    sidewalks: "Aceras",
    crossings: "Cruces",
    steps: "Escaleras",
    node: "Nodo",
    navigateToNode: "Navegar a este nodo",
    simulatedLocation: "Ubicación simulada",
    dragSimulatedPoint: "Arrastra este punto para probar otra ruta.",
    currentLocation: "Tu ubicación actual",
    simulatedLocationMovable: "Ubicación simulada movible",
    currentLocationAlt: "Tu ubicación actual",
    gpsTrackingActive: "Seguimiento GPS activo",
    outsideEventArea: "Estás fuera del área del evento",
    dragPointHint: "Arrastra el punto azul para probar rutas desde otra ubicación.",
    approximateAccuracy: "Precisión aproximada: {meters} m.",
    useExternalMaps: "Usa Google Maps o Apple Maps para llegar. Precisión: {meters} m.",
    permissionDenied: "El permiso fue rechazado. Habilita la ubicación en los ajustes del navegador.",
    deviceLocationFailed: "El dispositivo no pudo determinar tu ubicación.",
    locationTimedOut: "La solicitud tardó demasiado. Inténtalo nuevamente.",
    locationUnavailable: "Ubicación no disponible",
    locationUnavailableError: "No pudimos obtener tu ubicación",
    locationUnexpectedError: "Ocurrió un error al consultar la ubicación.",
    unsupportedGeolocation: "Este navegador no admite geolocalización.",
    requestingLocation: "Solicitando tu ubicación…",
    acceptLocationPermission: "Acepta el permiso del navegador para mostrar tu posición.",
    routeLocationRequest: "Obteniendo tu ubicación para calcular la ruta a {name}…",
    outsideRoute: "Estás fuera del área del evento. Usa Google Maps o Apple Maps para llegar a {name}.",
    walkingNetworkUnavailable: "La red peatonal no está disponible. Recarga la página e inténtalo otra vez.",
    preparingNetwork: "Preparando la red peatonal…",
    noRoute: "No se encontró una conexión peatonal hasta {name}.",
    routeSummary: "Ruta a {name}: {distance} m · {minutes} min aprox. Los extremos punteados conectan con la acera.",
    openGoogleMaps: "Abrir ruta a {name} en Google Maps",
    openAppleMaps: "Abrir ruta a {name} en Apple Maps",
    appleMapsUnavailable: "Apple Maps estará disponible al obtener tu ubicación",
    iframeTitle: "Mapa peatonal de {place}",
  },
  en: {
    pageTitle: "Event map",
    loadingDemo: "Loading demo…",
    eventEyebrow: "Event navigation",
    appTitle: "Find your destination",
    demoSelectorAria: "Select another demo",
    destinationsAria: "Available destinations",
    destinationSingular: "destination",
    destinationPlural: "destinations",
    footerRoutes: "Walking routes",
    footerGps: "Live GPS",
    embedTitle: "Iframe settings",
    embedDescription: "Choose which location routes use when the embed opens.",
    testLocation: "Use test location",
    copyEmbed: "Copy to embed",
    copySuccess: "Iframe copied. Paste it into your site's HTML/Embed block.",
    copyFallback: "Could not copy; downloaded a TXT file with the iframe.",
    selectedRoute: "Selected route",
    routeSummaryLoading: "Preparing the walking network…",
    closeMap: "Close",
    mapAria: "Interactive map of the event area",
    externalMapAria: "Open route in another app",
    continueRoute: "Continue route in",
    locationNotRequested: "Location not requested yet",
    locationRequestIntro: "We’ll request it to calculate the route.",
    loadingLocationTitle: "Getting your location",
    loadingLocationMessage: "This may take a few seconds…",
    mapAlt: "Map of the event area based on OpenStreetMap",
    networkReady: "Network ready: {count} walkable points.",
    networkLoadError: "Could not load the walking network.",
    legendTitle: "Walking network",
    sidewalks: "Sidewalks",
    crossings: "Crossings",
    steps: "Stairs",
    node: "Node",
    navigateToNode: "Navigate to this node",
    simulatedLocation: "Simulated location",
    dragSimulatedPoint: "Drag this point to try another route.",
    currentLocation: "Your current location",
    simulatedLocationMovable: "Movable simulated location",
    currentLocationAlt: "Your current location",
    gpsTrackingActive: "GPS tracking active",
    outsideEventArea: "You are outside the event area",
    dragPointHint: "Drag the blue dot to try routes from another location.",
    approximateAccuracy: "Approximate accuracy: {meters} m.",
    useExternalMaps: "Use Google Maps or Apple Maps to get there. Accuracy: {meters} m.",
    permissionDenied: "Permission denied. Enable location in your browser settings.",
    deviceLocationFailed: "Your device could not determine your location.",
    locationTimedOut: "The request timed out. Please try again.",
    locationUnavailable: "Location unavailable",
    locationUnavailableError: "We couldn't get your location",
    locationUnexpectedError: "An error occurred while checking your location.",
    unsupportedGeolocation: "This browser does not support geolocation.",
    requestingLocation: "Requesting your location…",
    acceptLocationPermission: "Allow location access in your browser to show your position.",
    routeLocationRequest: "Getting your location to calculate the route to {name}…",
    outsideRoute: "You are outside the event area. Use Google Maps or Apple Maps to get to {name}.",
    walkingNetworkUnavailable: "The walking network is unavailable. Reload the page and try again.",
    preparingNetwork: "Preparing the walking network…",
    noRoute: "No walking connection to {name} was found.",
    routeSummary: "Route to {name}: {distance} m · about {minutes} min. Dotted ends connect to the sidewalk.",
    openGoogleMaps: "Open route to {name} in Google Maps",
    openAppleMaps: "Open route to {name} in Apple Maps",
    appleMapsUnavailable: "Apple Maps will be available when your location is known",
    iframeTitle: "Walking map for {place}",
  },
  pt: {
    pageTitle: "Mapa do evento",
    loadingDemo: "Carregando demo…",
    eventEyebrow: "Navegação do evento",
    appTitle: "Encontre seu destino",
    demoSelectorAria: "Selecionar outro demo",
    destinationsAria: "Destinos disponíveis",
    destinationSingular: "destino",
    destinationPlural: "destinos",
    footerRoutes: "Rotas a pé",
    footerGps: "GPS em tempo real",
    embedTitle: "Configuração do iframe",
    embedDescription: "Escolha a localização usada para calcular rotas ao abrir o embed.",
    testLocation: "Usar localização de teste",
    copyEmbed: "Copiar iframe",
    copySuccess: "Iframe copiado. Cole-o no bloco HTML/Embed do seu site.",
    copyFallback: "Não foi possível copiar; baixei um arquivo TXT com o iframe.",
    selectedRoute: "Rota selecionada",
    routeSummaryLoading: "Preparando a rede para pedestres…",
    closeMap: "Fechar",
    mapAria: "Mapa interativo da área do evento",
    externalMapAria: "Abrir rota em outro aplicativo",
    continueRoute: "Continuar rota em",
    locationNotRequested: "Localização ainda não solicitada",
    locationRequestIntro: "Vamos solicitá-la para calcular a rota.",
    loadingLocationTitle: "Obtendo sua localização",
    loadingLocationMessage: "Isso pode levar alguns segundos…",
    mapAlt: "Mapa da área do evento baseado no OpenStreetMap",
    networkReady: "Rede pronta: {count} pontos caminháveis.",
    networkLoadError: "Não foi possível carregar a rede para pedestres.",
    legendTitle: "Rede para pedestres",
    sidewalks: "Calçadas",
    crossings: "Travessias",
    steps: "Escadas",
    node: "Nó",
    navigateToNode: "Navegar até este ponto",
    simulatedLocation: "Localização simulada",
    dragSimulatedPoint: "Arraste este ponto para testar outra rota.",
    currentLocation: "Sua localização atual",
    simulatedLocationMovable: "Localização simulada móvel",
    currentLocationAlt: "Sua localização atual",
    gpsTrackingActive: "Rastreamento GPS ativo",
    outsideEventArea: "Você está fora da área do evento",
    dragPointHint: "Arraste o ponto azul para testar rotas de outra localização.",
    approximateAccuracy: "Precisão aproximada: {meters} m.",
    useExternalMaps: "Use o Google Maps ou o Apple Maps para chegar. Precisão: {meters} m.",
    permissionDenied: "Permissão negada. Ative a localização nas configurações do navegador.",
    deviceLocationFailed: "Não foi possível determinar sua localização.",
    locationTimedOut: "A solicitação demorou muito. Tente novamente.",
    locationUnavailable: "Localização indisponível",
    locationUnavailableError: "Não foi possível obter sua localização",
    locationUnexpectedError: "Ocorreu um erro ao consultar a localização.",
    unsupportedGeolocation: "Este navegador não oferece suporte à geolocalização.",
    requestingLocation: "Solicitando sua localização…",
    acceptLocationPermission: "Permita o acesso à localização no navegador para mostrar sua posição.",
    routeLocationRequest: "Obtendo sua localização para calcular a rota até {name}…",
    outsideRoute: "Você está fora da área do evento. Use o Google Maps ou o Apple Maps para chegar a {name}.",
    walkingNetworkUnavailable: "A rede para pedestres está indisponível. Recarregue a página e tente novamente.",
    preparingNetwork: "Preparando a rede para pedestres…",
    noRoute: "Não foi encontrada uma conexão a pé até {name}.",
    routeSummary: "Rota até {name}: {distance} m · aprox. {minutes} min. As linhas pontilhadas conectam à calçada.",
    openGoogleMaps: "Abrir rota até {name} no Google Maps",
    openAppleMaps: "Abrir rota até {name} no Apple Maps",
    appleMapsUnavailable: "O Apple Maps estará disponível quando sua localização for obtida",
    iframeTitle: "Mapa para pedestres de {place}",
  },
  fr: {
    pageTitle: "Carte de l’événement",
    loadingDemo: "Chargement de la démo…",
    eventEyebrow: "Navigation de l’événement",
    appTitle: "Trouvez votre destination",
    demoSelectorAria: "Sélectionner une autre démo",
    destinationsAria: "Destinations disponibles",
    destinationSingular: "destination",
    destinationPlural: "destinations",
    footerRoutes: "Itinéraires piétonniers",
    footerGps: "GPS en temps réel",
    embedTitle: "Configuration de l’iframe",
    embedDescription: "Choisissez la position utilisée pour calculer l’itinéraire dans l’embed.",
    testLocation: "Utiliser une position de test",
    copyEmbed: "Copier l’iframe",
    copySuccess: "Iframe copié. Collez-le dans le bloc HTML/Embed de votre site.",
    copyFallback: "Copie impossible ; un fichier TXT contenant l’iframe a été téléchargé.",
    selectedRoute: "Itinéraire sélectionné",
    routeSummaryLoading: "Préparation du réseau piéton…",
    closeMap: "Fermer",
    mapAria: "Carte interactive de la zone de l’événement",
    externalMapAria: "Ouvrir l’itinéraire dans une autre application",
    continueRoute: "Continuer l’itinéraire avec",
    locationNotRequested: "Position pas encore demandée",
    locationRequestIntro: "Elle sera demandée pour calculer l’itinéraire.",
    loadingLocationTitle: "Localisation en cours",
    loadingLocationMessage: "Cela peut prendre quelques secondes…",
    mapAlt: "Carte de la zone de l’événement basée sur OpenStreetMap",
    networkReady: "Réseau prêt : {count} points praticables.",
    networkLoadError: "Impossible de charger le réseau piéton.",
    legendTitle: "Réseau piéton",
    sidewalks: "Trottoirs",
    crossings: "Passages piétons",
    steps: "Escaliers",
    node: "Point",
    navigateToNode: "Itinéraire vers ce point",
    simulatedLocation: "Position simulée",
    dragSimulatedPoint: "Faites glisser ce point pour tester un autre itinéraire.",
    currentLocation: "Votre position actuelle",
    simulatedLocationMovable: "Position simulée déplaçable",
    currentLocationAlt: "Votre position actuelle",
    gpsTrackingActive: "Suivi GPS actif",
    outsideEventArea: "Vous êtes en dehors de la zone de l’événement",
    dragPointHint: "Faites glisser le point bleu pour tester un itinéraire depuis une autre position.",
    approximateAccuracy: "Précision approximative : {meters} m.",
    useExternalMaps: "Utilisez Google Maps ou Apple Plans pour vous y rendre. Précision : {meters} m.",
    permissionDenied: "Autorisation refusée. Activez la localisation dans les paramètres du navigateur.",
    deviceLocationFailed: "Votre appareil n’a pas pu déterminer votre position.",
    locationTimedOut: "La demande a expiré. Veuillez réessayer.",
    locationUnavailable: "Position indisponible",
    locationUnavailableError: "Impossible d’obtenir votre position",
    locationUnexpectedError: "Une erreur est survenue lors de la recherche de votre position.",
    unsupportedGeolocation: "Ce navigateur ne prend pas en charge la géolocalisation.",
    requestingLocation: "Demande de votre position…",
    acceptLocationPermission: "Autorisez l’accès à votre position dans le navigateur pour l’afficher.",
    routeLocationRequest: "Recherche de votre position pour calculer l’itinéraire vers {name}…",
    outsideRoute: "Vous êtes en dehors de la zone de l’événement. Utilisez Google Maps ou Apple Plans pour rejoindre {name}.",
    walkingNetworkUnavailable: "Le réseau piéton est indisponible. Rechargez la page et réessayez.",
    preparingNetwork: "Préparation du réseau piéton…",
    noRoute: "Aucun itinéraire piéton vers {name} n’a été trouvé.",
    routeSummary: "Itinéraire vers {name} : {distance} m · environ {minutes} min. Les pointillés relient au trottoir.",
    openGoogleMaps: "Ouvrir l’itinéraire vers {name} dans Google Maps",
    openAppleMaps: "Ouvrir l’itinéraire vers {name} dans Apple Plans",
    appleMapsUnavailable: "Apple Plans sera disponible lorsque votre position sera connue",
    iframeTitle: "Carte piétonne de {place}",
  },
};

function translate(key, values = {}) {
  return MESSAGES[LANGUAGE][key].replace(
    /\{(\w+)\}/g,
    (_match, name) => String(values[name] ?? ""),
  );
}

const MAP_BOUNDS = L.latLngBounds(
  DEMO_CONFIG.bounds.southWest,
  DEMO_CONFIG.bounds.northEast,
);
const EVENT_NODES = DEMO_CONFIG.nodes;
const MAP_OPTIONS = DEMO_CONFIG.mapOptions || {};
const IS_TEST_LOCATION =
  SEARCH_PARAMS.get("testLocation") === "1";
const IS_EMBED = SEARCH_PARAMS.get("embed") === "1";
const PUBLIC_APP_URL = "https://go-tracker-ten.vercel.app/";

if (IS_EMBED) APP_HOST.classList.add("is-embedded");

document.documentElement.lang = LANGUAGE;
if (APP_ROOT === document) document.title = translate("pageTitle");
APP_ROOT.querySelector("#event-eyebrow").textContent = translate("eventEyebrow");
APP_ROOT.querySelector("#app-title").textContent = translate("appTitle");
APP_ROOT.querySelector("#event-place").textContent = DEMO_CONFIG.place;
APP_ROOT.querySelector("#demo-selector").setAttribute("aria-label", translate("demoSelectorAria"));
APP_ROOT.querySelector(".destinations-section").setAttribute("aria-label", translate("destinationsAria"));
APP_ROOT.querySelector("#destination-count").textContent = `${new Intl.NumberFormat(LANGUAGE).format(EVENT_NODES.length)} ${translate(EVENT_NODES.length === 1 ? "destinationSingular" : "destinationPlural")}`;
APP_ROOT.querySelector("#footer-routes").textContent = translate("footerRoutes");
APP_ROOT.querySelector("#footer-gps").textContent = translate("footerGps");
APP_ROOT.querySelector("#embed-config-title").textContent = translate("embedTitle");
APP_ROOT.querySelector("#embed-config-description").textContent = translate("embedDescription");
APP_ROOT.querySelector("#test-location-label").textContent = translate("testLocation");
APP_ROOT.querySelector("#copy-iframe-button").textContent = translate("copyEmbed");
APP_ROOT.querySelector("#map-modal-eyebrow").textContent = translate("selectedRoute");
APP_ROOT.querySelector("#map-modal-title").textContent = translate("pageTitle");
APP_ROOT.querySelector("#route-summary").textContent = translate("routeSummaryLoading");
APP_ROOT.querySelector("#close-map-button").setAttribute("aria-label", translate("closeMap"));
APP_ROOT.querySelector("#close-map-label").textContent = translate("closeMap");
APP_ROOT.querySelector("#map").setAttribute("aria-label", translate("mapAria"));
APP_ROOT.querySelector("#external-map-actions").setAttribute("aria-label", translate("externalMapAria"));
APP_ROOT.querySelector("#external-map-actions-label").textContent = translate("continueRoute");
APP_ROOT.querySelector("#location-status-title").textContent = translate("locationNotRequested");
APP_ROOT.querySelector("#location-status-message").textContent = translate("locationRequestIntro");
APP_ROOT.querySelector("#location-loading-title").textContent = translate("loadingLocationTitle");
APP_ROOT.querySelector("#location-loading-message").textContent = translate("loadingLocationMessage");
APP_ROOT.querySelector("#app-loading-message").textContent = translate("loadingDemo");

const map = L.map(APP_ROOT.querySelector("#map"), {
  attributionControl: false,
  maxBounds: MAP_BOUNDS.pad(MAP_OPTIONS.maxBoundsPadding ?? 0.15),
  maxBoundsViscosity: 0.8,
  minZoom: MAP_OPTIONS.minZoom ?? 15,
  maxZoom: MAP_OPTIONS.maxZoom ?? 20,
  zoomControl: true,
});

map.createPane("baseImage");
map.getPane("baseImage").style.zIndex = 200;
map.getPane("baseImage").style.pointerEvents = "none";

L.imageOverlay(DEMO_CONFIG.assets.map, MAP_BOUNDS, {
  pane: "baseImage",
  alt: translate("mapAlt"),
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
  color: "#005d86",
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
      color: "#009ade",
      weight: 2,
      opacity: 0.32,
      dashArray: "5 5",
    };
  }

  if (highway === "steps") {
    return {
      color: "#004e70",
      weight: 2,
      opacity: 0.38,
      dashArray: "2 4",
    };
  }

  if (footway === "traffic_island") {
    return {
      color: "#007eb6",
      weight: 2,
      opacity: 0.32,
    };
  }

  return {
    color: footway === "sidewalk" ? "#005d86" : "#52606a",
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
      fillColor: "#009ade",
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

function projectCoordinateToSegment(coordinate, start, end) {
  const referenceLatitude = (start[1] + end[1]) / 2;
  const metersPerLongitude = 111320 * Math.cos((referenceLatitude * Math.PI) / 180);
  const metersPerLatitude = 110540;
  const segmentX = (end[0] - start[0]) * metersPerLongitude;
  const segmentY = (end[1] - start[1]) * metersPerLatitude;
  const pointX = (coordinate[0] - start[0]) * metersPerLongitude;
  const pointY = (coordinate[1] - start[1]) * metersPerLatitude;
  const segmentLengthSquared = segmentX ** 2 + segmentY ** 2;

  if (segmentLengthSquared === 0) {
    return { t: 0, distance: Infinity };
  }

  const t = (pointX * segmentX + pointY * segmentY) / segmentLengthSquared;
  const closestX = segmentX * t;
  const closestY = segmentY * t;
  const distance = Math.hypot(pointX - closestX, pointY - closestY);
  return { t, distance };
}

function buildWalkingGraph(data, snapToleranceMeters = 0.75) {
  const nodes = new Map();
  const walkableFeatures = data.features.filter(isWalkableLine);
  const snapCandidates = new Map();

  walkableFeatures.forEach((feature) => {
    feature.geometry.coordinates.forEach((coordinate) => {
      const key = `${coordinate[0].toFixed(7)},${coordinate[1].toFixed(7)}`;
      if (!snapCandidates.has(key)) {
        snapCandidates.set(key, coordinate);
      }
    });
  });

  const candidateCoordinates = [...snapCandidates.values()];
  const referenceLatitude = candidateCoordinates.length
    ? candidateCoordinates.reduce((sum, coordinate) => sum + coordinate[1], 0) /
      candidateCoordinates.length
    : 0;
  const longitudeScale = 111320 * Math.cos((referenceLatitude * Math.PI) / 180);
  const latitudeScale = 110540;
  const gridCellSize = Math.max(4, snapToleranceMeters * 2);
  const snapGrid = new Map();

  candidateCoordinates.forEach((coordinate) => {
    const x = coordinate[0] * longitudeScale;
    const y = coordinate[1] * latitudeScale;
    const gridX = Math.floor(x / gridCellSize);
    const gridY = Math.floor(y / gridCellSize);
    const gridKey = `${gridX},${gridY}`;
    if (!snapGrid.has(gridKey)) snapGrid.set(gridKey, []);
    snapGrid.get(gridKey).push(coordinate);
  });

  function getNearbySnapCandidates(start, end) {
    const startX = start[0] * longitudeScale;
    const startY = start[1] * latitudeScale;
    const endX = end[0] * longitudeScale;
    const endY = end[1] * latitudeScale;
    const minGridX = Math.floor(
      (Math.min(startX, endX) - snapToleranceMeters) / gridCellSize,
    );
    const maxGridX = Math.floor(
      (Math.max(startX, endX) + snapToleranceMeters) / gridCellSize,
    );
    const minGridY = Math.floor(
      (Math.min(startY, endY) - snapToleranceMeters) / gridCellSize,
    );
    const maxGridY = Math.floor(
      (Math.max(startY, endY) + snapToleranceMeters) / gridCellSize,
    );
    const nearby = [];

    for (let gridX = minGridX; gridX <= maxGridX; gridX += 1) {
      for (let gridY = minGridY; gridY <= maxGridY; gridY += 1) {
        const bucket = snapGrid.get(`${gridX},${gridY}`);
        if (bucket) nearby.push(...bucket);
      }
    }

    return nearby;
  }

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

  walkableFeatures.forEach((feature) => {
    const coordinates = feature.geometry.coordinates;

    for (let index = 1; index < coordinates.length; index += 1) {
      const startCoordinate = coordinates[index - 1];
      const endCoordinate = coordinates[index];
      const splitCoordinates = [
        { coordinate: startCoordinate, t: 0 },
        { coordinate: endCoordinate, t: 1 },
      ];

      getNearbySnapCandidates(startCoordinate, endCoordinate).forEach((candidate) => {
        const projection = projectCoordinateToSegment(
          candidate,
          startCoordinate,
          endCoordinate,
        );

        if (
          projection.t > 0.000001 &&
          projection.t < 0.999999 &&
          projection.distance <= snapToleranceMeters
        ) {
          splitCoordinates.push({ coordinate: candidate, t: projection.t });
        }
      });

      splitCoordinates.sort((first, second) => first.t - second.t);

      for (let splitIndex = 1; splitIndex < splitCoordinates.length; splitIndex += 1) {
        const start = getNode(splitCoordinates[splitIndex - 1].coordinate);
        const end = getNode(splitCoordinates[splitIndex].coordinate);
        const distance = start.latlng.distanceTo(end.latlng);

        if (distance <= 0) continue;
        if (!start.edges.has(end.key) || start.edges.get(end.key) > distance) {
          start.edges.set(end.key, distance);
          end.edges.set(start.key, distance);
        }
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

fetch(DEMO_CONFIG.assets.walkways)
  .then((response) => {
    if (!response.ok) {
      throw new Error(`No se pudo cargar el GeoJSON (${response.status})`);
    }
    return response.json();
  })
  .then((data) => {
    walkingGraph = buildWalkingGraph(
      data,
      DEMO_CONFIG.routing?.snapToleranceMeters ?? 0.75,
    );

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
      routeSummary.textContent = translate("networkReady", {
        count: walkingGraph.nodes.size.toLocaleString(LANGUAGE),
      });
    }
  })
  .catch((error) => {
    console.error(error);
    graphLoadError = error;
    routeSummary.textContent = translate("networkLoadError");
  });

map.on("zoomend", updateCrossingPointVisibility);

const walkwayLegend = L.control({ position: "bottomleft" });
walkwayLegend.onAdd = () => {
  const container = L.DomUtil.create("div", "walkway-legend");
  container.innerHTML = `
    <strong>${translate("legendTitle")}</strong>
    <span><i class="walkway-legend__line walkway-legend__line--sidewalk"></i>${translate("sidewalks")}</span>
    <span><i class="walkway-legend__line walkway-legend__line--crossing"></i>${translate("crossings")}</span>
    <span><i class="walkway-legend__line walkway-legend__line--steps"></i>${translate("steps")}</span>
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
    alt: `${translate("node")} ${node.name}`,
    keyboard: true,
  }).addTo(map);

  marker.bindTooltip(node.name, {
    permanent: true,
    direction: "top",
    offset: [0, -20],
    className: "event-node-label",
  });

  marker.bindPopup(
    `
      <article class="node-popup">
        <span>${translate("node")} ${nodeNumber}</span>
        <strong>${node.name}</strong>
        <small>${node.coordinates[0].toFixed(6)}, ${node.coordinates[1].toFixed(6)}</small>
        <button class="node-popup__navigate" type="button">
          ${translate("navigateToNode")}
        </button>
      </article>
    `,
    {
      className: "event-node-popup",
      minWidth: 210,
      maxWidth: 260,
      autoPanPadding: [24, 24],
    },
  );

  marker.on("popupopen", (event) => {
    const navigateButton = event.popup
      .getElement()
      ?.querySelector(".node-popup__navigate");

    navigateButton?.addEventListener("click", () => navigateToNode(node), {
      once: true,
    });
  });
});

const locationStatusDot = APP_ROOT.querySelector("#location-status-dot");
const locationStatusTitle = APP_ROOT.querySelector("#location-status-title");
const locationStatusMessage = APP_ROOT.querySelector("#location-status-message");
const routeButtons = APP_ROOT.querySelector("#route-buttons");
const routeSummary = APP_ROOT.querySelector("#route-summary");
const testLocationToggle = APP_ROOT.querySelector("#test-location-toggle");
const copyIframeButton = APP_ROOT.querySelector("#copy-iframe-button");
const embedConfigStatus = APP_ROOT.querySelector("#embed-config-status");
const mapModal = APP_ROOT.querySelector("#map-modal");
const mapModalTitle = APP_ROOT.querySelector("#map-modal-title");
const closeMapButton = APP_ROOT.querySelector("#close-map-button");
const locationLoading = APP_ROOT.querySelector("#location-loading");
const googleMapsLink = APP_ROOT.querySelector("#google-maps-link");
const appleMapsLink = APP_ROOT.querySelector("#apple-maps-link");
const externalMapActions = APP_ROOT.querySelector("#external-map-actions");
const homeMain = APP_ROOT.querySelector(".home-main");
const homeTopbar = APP_ROOT.querySelector(".home-topbar");

let userLocationMarker;
let userCoordinates;
let activeRoute;
let pendingRouteNode;
let lastFocusedRouteButton;
let activeDestinationNode;
let locationWatchId;
let lastRouteOrigin;
let hasAdjustedInitialLocation = false;
let simulatedLocationFrame;
let pendingSimulatedCoordinates;

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

function simulatedPosition(latlng) {
  return {
    coords: {
      latitude: latlng.lat,
      longitude: latlng.lng,
      accuracy: 1,
      isSimulated: true,
    },
  };
}

function updateDraggedSimulatedLocation(latlng, forceRoute = false) {
  pendingSimulatedCoordinates = latlng;

  if (forceRoute) {
    if (simulatedLocationFrame) cancelAnimationFrame(simulatedLocationFrame);
    simulatedLocationFrame = undefined;
    pendingSimulatedCoordinates = undefined;
    lastRouteOrigin = undefined;
    showUserLocation(simulatedPosition(latlng));
    return;
  }

  if (simulatedLocationFrame) return;
  simulatedLocationFrame = requestAnimationFrame(() => {
    const nextCoordinates = pendingSimulatedCoordinates;
    simulatedLocationFrame = undefined;
    pendingSimulatedCoordinates = undefined;
    showUserLocation(simulatedPosition(nextCoordinates));
  });
}

function showUserLocation(position) {
  const { latitude, longitude, accuracy, isSimulated } = position.coords;
  const coordinates = L.latLng(latitude, longitude);
  userCoordinates = coordinates;
  setLocationLoading(false);

  if (activeDestinationNode) {
    updateExternalMapLinks(activeDestinationNode);
  }

  if (!userLocationMarker) {
    userLocationMarker = L.marker(coordinates, {
      icon: userLocationIcon,
      title: IS_TEST_LOCATION
        ? translate("simulatedLocationMovable")
        : translate("currentLocation"),
      alt: IS_TEST_LOCATION
        ? translate("simulatedLocationMovable")
        : translate("currentLocationAlt"),
      zIndexOffset: 1000,
      draggable: IS_TEST_LOCATION,
      autoPan: IS_TEST_LOCATION,
    })
      .bindPopup(
        IS_TEST_LOCATION
          ? `<strong>${translate("simulatedLocation")}</strong><br><small>${translate("dragSimulatedPoint")}</small>`
          : `<strong>${translate("currentLocation")}</strong>`,
      )
      .addTo(map);

    if (IS_TEST_LOCATION) {
      userLocationMarker.on("drag", (event) => {
        updateDraggedSimulatedLocation(event.target.getLatLng());
      });
      userLocationMarker.on("dragend", (event) => {
        updateDraggedSimulatedLocation(event.target.getLatLng(), true);
      });
    }
  } else {
    userLocationMarker.setLatLng(coordinates);
  }

  const isInsideEvent = MAP_BOUNDS.contains(coordinates);
  const accuracyLabel = Math.round(accuracy);

  updateLocationStatus(
    isInsideEvent ? "success" : "error",
    isInsideEvent
      ? isSimulated
        ? translate("simulatedLocation")
        : translate("gpsTrackingActive")
      : translate("outsideEventArea"),
    isInsideEvent
      ? isSimulated
        ? translate("dragPointHint")
        : translate("approximateAccuracy", { meters: accuracyLabel })
      : translate("useExternalMaps", { meters: accuracyLabel }),
  );
  externalMapActions.classList.toggle("is-recommended", !isInsideEvent);

  if (!hasAdjustedInitialLocation) {
    hasAdjustedInitialLocation = true;

    if (isInsideEvent) {
      map.setView(
        coordinates,
        Math.max(map.getZoom(), MAP_OPTIONS.locationZoom ?? 18),
        { animate: true },
      );
    } else {
      map.fitBounds(L.latLngBounds([coordinates, MAP_BOUNDS.getCenter()]), {
        padding: [50, 50],
        maxZoom: 15,
      });
    }
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
    1: translate("permissionDenied"),
    2: translate("deviceLocationFailed"),
    3: translate("locationTimedOut"),
  };

  setLocationLoading(false);

  if (error.code === 1) {
    stopLocationTracking();
  }

  updateLocationStatus(
    "error",
    translate("locationUnavailableError"),
    messages[error.code] || translate("locationUnexpectedError"),
  );

  if (pendingRouteNode) {
    routeSummary.textContent =
      messages[error.code] || translate("locationUnavailableError");
  }
}

function requestUserLocation(options = {}) {
  const showLoader = options.showLoader ?? true;

  if (IS_TEST_LOCATION) {
    const center = MAP_BOUNDS.getCenter();
    setLocationLoading(false);
    showUserLocation({
      coords: {
        latitude: center.lat,
        longitude: center.lng,
        accuracy: 1,
        isSimulated: true,
      },
    });
    return;
  }

  if (!navigator.geolocation) {
    setLocationLoading(false);
    updateLocationStatus(
      "error",
      translate("locationUnavailable"),
      translate("unsupportedGeolocation"),
    );
    return;
  }

  stopLocationTracking();
  setLocationLoading(showLoader);
  updateLocationStatus(
    "loading",
    translate("requestingLocation"),
    translate("acceptLocationPermission"),
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
    routeSummary.textContent = translate("routeLocationRequest", {
      name: node.name,
    });
    requestUserLocation();
    return;
  }

  if (!MAP_BOUNDS.contains(userCoordinates)) {
    if (activeRoute) {
      activeRoute.remove();
      activeRoute = undefined;
    }
    externalMapActions.classList.add("is-recommended");
    routeSummary.textContent = translate("outsideRoute", { name: node.name });
    return;
  }

  externalMapActions.classList.remove("is-recommended");

  if (graphLoadError) {
    routeSummary.textContent = translate("walkingNetworkUnavailable");
    return;
  }

  if (!walkingGraph) {
    routeSummary.textContent = translate("preparingNetwork");
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
    routeSummary.textContent = translate("noRoute", { name: node.name });
    return;
  }

  if (activeRoute) {
    activeRoute.remove();
  }

  const routeLayers = [];
  const connectorStyle = {
    color: "#78bde0",
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
        color: "#007eb6",
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

  APP_ROOT.querySelectorAll(".route-button").forEach((button) => {
    const isActive = button.dataset.nodeId === node.id;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  const distanceMeters = Math.round(
    result.distance + snapPair.startDistance + snapPair.endDistance,
  );
  const walkingMinutes = Math.max(1, Math.ceil(distanceMeters / 80));
  routeSummary.textContent = translate("routeSummary", {
    name: node.name,
    distance: distanceMeters.toLocaleString(LANGUAGE),
    minutes: walkingMinutes,
  });
  if (fitMap && activeRoute.getBounds().isValid()) {
    map.fitBounds(activeRoute.getBounds(), {
      padding: [70, 70],
      maxZoom: MAP_OPTIONS.routeMaxZoom ?? 18,
    });
  }
}

function updateExternalMapLinks(node) {
  const [latitude, longitude] = node.coordinates;
  const destination = encodeURIComponent(`${latitude},${longitude}`);

  googleMapsLink.href = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=walking`;
  googleMapsLink.setAttribute(
    "aria-label",
    translate("openGoogleMaps", { name: node.name }),
  );

  if (userCoordinates) {
    const source = encodeURIComponent(`${userCoordinates.lat},${userCoordinates.lng}`);
    appleMapsLink.href = `https://maps.apple.com/directions?source=${source}&destination=${destination}&mode=walking`;
    appleMapsLink.classList.remove("is-disabled");
    appleMapsLink.setAttribute("aria-disabled", "false");
    appleMapsLink.setAttribute(
      "aria-label",
      translate("openAppleMaps", { name: node.name }),
    );
    appleMapsLink.tabIndex = 0;
  } else {
    appleMapsLink.removeAttribute("href");
    appleMapsLink.classList.add("is-disabled");
    appleMapsLink.setAttribute("aria-disabled", "true");
    appleMapsLink.setAttribute("aria-label", translate("appleMapsUnavailable"));
    appleMapsLink.tabIndex = -1;
  }
}

function selectDestination(node) {
  activeDestinationNode = node;
  mapModalTitle.textContent = node.name;
  updateExternalMapLinks(node);

  APP_ROOT.querySelectorAll(".route-button").forEach((button) => {
    const isActive = button.dataset.nodeId === node.id;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

function navigateToNode(node) {
  selectDestination(node);
  map.closePopup();
  calculateWalkingRoute(node);
}

function openMapModal(node, triggerButton) {
  lastFocusedRouteButton = triggerButton;
  selectDestination(node);
  mapModal.classList.add("is-open");
  mapModal.setAttribute("aria-hidden", "false");
  APP_HOST.classList.add("modal-open");
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
  APP_HOST.classList.remove("modal-open");
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

if (testLocationToggle) {
  testLocationToggle.checked = IS_TEST_LOCATION;
  testLocationToggle.addEventListener("change", () => {
    const url = new URL(window.location.href);
    if (testLocationToggle.checked) {
      url.searchParams.set("testLocation", "1");
    } else {
      url.searchParams.delete("testLocation");
    }
    window.location.assign(url.href);
  });
}

copyIframeButton?.addEventListener("click", async () => {
  const embedUrl = new URL(PUBLIC_APP_URL);
  embedUrl.searchParams.set("demo", DEMO_CONFIG.id);
  embedUrl.searchParams.set("embed", "1");
  embedUrl.searchParams.set("lang", LANGUAGE);
  if (testLocationToggle?.checked) {
    embedUrl.searchParams.set("testLocation", "1");
  }

  const title = translate("iframeTitle", {
    place: DEMO_CONFIG.place || DEMO_CONFIG.id,
  }).replace(
    /[&"<]/g,
    (character) => ({ "&": "&amp;", '"': "&quot;", "<": "&lt;" })[character],
  );
  const iframeCode = `<iframe
  src="${embedUrl.href}"
  title="${title}"
  width="100%"
  height="480"
  style="border: 0"
  loading="lazy"
  allow="geolocation"
></iframe>`;

  try {
    await navigator.clipboard.writeText(iframeCode);
    embedConfigStatus.textContent = translate("copySuccess");
  } catch (error) {
    console.error(error);
    const blob = new Blob([iframeCode], { type: "text/plain;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `${DEMO_CONFIG.id}-iframe.txt`;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
    embedConfigStatus.textContent = translate("copyFallback");
  }
});

closeMapButton.addEventListener("click", closeMapModal);
APP_ROOT.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && mapModal.classList.contains("is-open")) {
    closeMapModal();
  }
});
