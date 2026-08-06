(async function loadSelectedDemo() {
  const errorMessage = document.querySelector("#app-loading-message");
  const demoSelector = document.querySelector("#demo-selector");

  try {
    const manifestResponse = await fetch("demos/manifest.json");
    if (!manifestResponse.ok) {
      throw new Error(`No se pudo cargar el manifiesto (${manifestResponse.status})`);
    }

    const manifest = await manifestResponse.json();
    const requestedDemo = new URLSearchParams(window.location.search).get("demo");
    const selectedDemo =
      manifest.demos.find((demo) => demo.id === requestedDemo) ||
      manifest.demos.find((demo) => demo.id === manifest.defaultDemo);

    if (!selectedDemo) {
      throw new Error("No hay un demo predeterminado configurado.");
    }

    demoSelector.replaceChildren();
    manifest.demos.forEach((demo) => {
      const option = document.createElement("option");
      option.value = demo.id;
      option.textContent = demo.name;
      demoSelector.append(option);
    });
    demoSelector.value = selectedDemo.id;
    demoSelector.disabled = false;
    demoSelector.addEventListener("change", () => {
      const url = new URL(window.location.href);
      url.searchParams.set("demo", demoSelector.value);
      window.location.assign(url);
    });

    const dataUrl = new URL(selectedDemo.data, window.location.href);
    const dataResponse = await fetch(dataUrl);
    if (!dataResponse.ok) {
      throw new Error(`No se pudo cargar el demo (${dataResponse.status})`);
    }

    const data = await dataResponse.json();
    window.ACTIVE_DEMO = {
      ...data,
      id: selectedDemo.id,
      assets: {
        map: new URL(data.assets.map, dataUrl).href,
        walkways: new URL(data.assets.walkways, dataUrl).href,
      },
    };

    const script = document.createElement("script");
    const appUrl = new URL("app.js", window.location.href);
    appUrl.searchParams.set(
      "v",
      `${data.version || selectedDemo.id}-routing-snap-1`,
    );
    script.src = appUrl.href;
    script.addEventListener("error", () => {
      errorMessage.textContent = "No se pudo iniciar la aplicación.";
    });
    document.body.append(script);
  } catch (error) {
    console.error(error);
    errorMessage.textContent = "No se pudo cargar este demo. Revisa su configuración.";
  }
})();
