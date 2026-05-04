import { useEffect, useRef, useState } from "react";

let mapsLoaded = false;
let mapsLoading = false;
const loadCallbacks: (() => void)[] = [];
let styleInjected = false;

/** Strip "-NNNN" off any 5-digit zip. We only store 5-digit zips. */
export function stripZipPlus4(addr: string): string {
  return addr.replace(/(\b\d{5})-\d{4}\b/g, "$1");
}

/** Inject styles that force the Google autocomplete web component to match our UI */
function injectAutocompleteStyles() {
  if (styleInjected) return;
  styleInjected = true;
  const style = document.createElement("style");
  style.textContent = `
    gmp-place-autocomplete {
      background-color: white !important;
      border: 1px solid hsl(var(--input)) !important;
      border-radius: 0.375rem !important;
      height: 36px !important;
      font-size: 0.875rem !important;
      color: #111 !important;
      --gmpac-color-on-surface: #111 !important;
      --gmpac-color-surface: white !important;
      --gmpac-color-on-surface-variant: #666 !important;
    }
    gmp-place-autocomplete input {
      background-color: white !important;
      color: #111 !important;
    }
  `;
  document.head.appendChild(style);
}

/**
 * Google's inline bootstrap loader — the ONLY way to get
 * `google.maps.importLibrary()` to work (loads async, no deprecation warnings).
 */
function installBootstrapLoader(key: string) {
  if ((window as any).google?.maps?.importLibrary) return;

  const g: Record<string, string> = { key, v: "weekly" };
  const c = "google";
  const l = "importLibrary";
  const q = "__ib__";
  const m = document;
  const b = window as any;
  b[c] = b[c] || {};
  const d = (b[c].maps = b[c].maps || {});
  const r = new Set<string>();
  const e = new URLSearchParams();
  let h: Promise<void> | undefined;
  let a: HTMLScriptElement;

  const u = () =>
    h ||
    (h = new Promise<void>(async (f, n) => {
      a = m.createElement("script");
      e.set("libraries", [...r] + "");
      for (const k in g)
        e.set(
          k.replace(/[A-Z]/g, (t) => "_" + t[0].toLowerCase()),
          g[k],
        );
      e.set("callback", c + ".maps." + q);
      a.src = `https://maps.googleapis.com/maps/api/js?` + e;
      d[q] = f;
      a.onerror = () => ((h = undefined), n(new Error("Google Maps JS SDK failed to load")));
      a.nonce = (m.querySelector("script[nonce]") as HTMLScriptElement)?.nonce || "";
      m.head.append(a);
    }));

  d[l]
    ? console.warn("Google Maps JS API only loads once.")
    : (d[l] = (f: string, ...n: any[]) => r.add(f) && u().then(() => d[l](f, ...n)));
}

async function loadGooglePlaces(): Promise<void> {
  if (mapsLoaded) return;

  if (mapsLoading) {
    return new Promise((resolve) => {
      loadCallbacks.push(resolve);
    });
  }

  mapsLoading = true;

  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  if (!key) {
    console.warn("VITE_GOOGLE_MAPS_API_KEY is not set — address autocomplete disabled");
    mapsLoading = false;
    return;
  }

  installBootstrapLoader(key);

  try {
    await google.maps.importLibrary("places");
    await google.maps.importLibrary("geocoding");
    mapsLoaded = true;
    mapsLoading = false;
    loadCallbacks.forEach((cb) => cb());
    loadCallbacks.length = 0;
  } catch (err) {
    console.error("Failed to load Google Places library:", err);
    mapsLoading = false;
  }
}

/**
 * Geocode an address string. Returns lat/lng AND the full address with zip
 * guaranteed (built from address_components).
 */
async function geocodeAndBuild(rawAddr: string): Promise<{
  address: string;
  lat: number;
  lng: number;
}> {
  try {
    const geocoder = new google.maps.Geocoder();
    const result = await geocoder.geocode({ address: rawAddr });
    const top = result.results?.[0];
    if (!top) return { address: rawAddr, lat: 0, lng: 0 };

    const loc = top.geometry?.location;
    const lat = loc ? loc.lat() : 0;
    const lng = loc ? loc.lng() : 0;

    // Build address from components so zip is always included
    const comps = top.address_components || [];
    const get = (type: string, short = false): string => {
      const c = comps.find((comp: any) => comp.types?.includes(type));
      if (!c) return "";
      return short ? (c.short_name || "") : (c.long_name || "");
    };

    const streetNumber = get("street_number");
    const route = get("route");
    const city =
      get("locality") ||
      get("sublocality_level_1") ||
      get("administrative_area_level_3");
    const state = get("administrative_area_level_1", true);
    const zip = get("postal_code");

    const street = [streetNumber, route].filter(Boolean).join(" ");
    const stateZip = [state, zip].filter(Boolean).join(" ");
    const built = [street, city, stateZip].filter(Boolean).join(", ");

    // Use the built address if we got meaningful components, else fall back
    const address = built || rawAddr;
    return { address, lat, lng };
  } catch (err) {
    console.warn("Geocoding failed:", err);
    return { address: rawAddr, lat: 0, lng: 0 };
  }
}

/** Try to reach the <input> inside the web component's shadow DOM */
function getShadowInput(pac: HTMLElement): HTMLInputElement | null {
  return pac.shadowRoot?.querySelector("input") ?? null;
}

export interface AddressResult {
  address: string;
  lat: number;
  lng: number;
}

interface Props {
  value: string;
  onChange: (result: AddressResult) => void;
  placeholder?: string;
  className?: string;
}

export function AddressAutocomplete({ value, onChange, placeholder, className }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pacRef = useRef<HTMLElement | null>(null);
  const onChangeRef = useRef(onChange);
  const lastEmittedRef = useRef<string>(value);
  const [ready, setReady] = useState(mapsLoaded);
  const [fallback, setFallback] = useState(false);

  // Keep the ref current so event listeners always call the latest onChange
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Load the Google Places SDK
  useEffect(() => {
    loadGooglePlaces()
      .then(() => setReady(true))
      .catch(() => setFallback(true));
  }, []);

  // Create the PlaceAutocompleteElement once the SDK is ready
  useEffect(() => {
    if (!ready || !containerRef.current || pacRef.current) return;

    if (!(window as any).google?.maps?.places?.PlaceAutocompleteElement) {
      setFallback(true);
      return;
    }

    try {
      // @ts-ignore — PlaceAutocompleteElement types lag behind the runtime
      const pac = new google.maps.places.PlaceAutocompleteElement({
        componentRestrictions: { country: "us" },
        types: ["address"],
      });

      pac.style.width = "100%";
      injectAutocompleteStyles();

      // Listen for place selection
      for (const evtName of ["gmp-placeselect", "gmp-select"]) {
        pac.addEventListener(evtName, () => {
          setTimeout(async () => {
            const rawAddr = (pac as any).value || "";
            if (!rawAddr) return;

            // Geocode to get lat/lng + build address with guaranteed zip
            const result = await geocodeAndBuild(rawAddr);
            const addr = stripZipPlus4(result.address);

            // Sync the full address (with zip) back into the input
            const inp = getShadowInput(pac);
            if (inp && inp.value !== addr) inp.value = addr;

            lastEmittedRef.current = addr;
            onChangeRef.current({ address: addr, lat: result.lat, lng: result.lng });
          }, 50);
        });
      }

      // Propagate manual edits on blur (user typed without picking a suggestion)
      const handleBlur = () => {
        const inp = getShadowInput(pac);
        if (!inp) return;
        let current = stripZipPlus4(inp.value);
        if (current !== inp.value) inp.value = current;
        if (current && current !== lastEmittedRef.current) {
          lastEmittedRef.current = current;
          onChangeRef.current({ address: current, lat: 0, lng: 0 });
        }
      };

      containerRef.current.appendChild(pac);
      pacRef.current = pac;

      // Pierce shadow DOM to set initial value + styles + blur listener
      const initShadow = () => {
        const shadow = pac.shadowRoot;
        if (!shadow) return;
        const s = document.createElement("style");
        s.textContent = `
          input { background: white !important; color: #111 !important; }
          * { color: #111 !important; }
        `;
        shadow.appendChild(s);
        const inp = shadow.querySelector("input");
        if (inp) {
          if (value) inp.value = value;
          if (placeholder) inp.placeholder = placeholder;
          inp.addEventListener("blur", handleBlur);
        }
      };
      initShadow();
      setTimeout(initShadow, 100);
      setTimeout(initShadow, 500);
    } catch (err) {
      console.error("Failed to create PlaceAutocompleteElement:", err);
      setFallback(true);
    }

    return () => {
      if (pacRef.current && containerRef.current) {
        try {
          containerRef.current.removeChild(pacRef.current);
        } catch {}
        pacRef.current = null;
      }
    };
  }, [ready]);

  // Sync external value changes (e.g. patient switch) into the shadow input
  useEffect(() => {
    if (!pacRef.current || value === lastEmittedRef.current) return;
    lastEmittedRef.current = value ?? "";
    const inp = getShadowInput(pacRef.current);
    if (inp) inp.value = value ?? "";
  }, [value]);

  // Fallback: plain <input> when Google SDK is unavailable
  if (!ready || fallback) {
    return (
      <input
        className={
          className ??
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        }
        value={value}
        onChange={(e) => onChange({ address: e.target.value, lat: 0, lng: 0 })}
        placeholder={placeholder ?? "Start typing address…"}
      />
    );
  }

  return <div ref={containerRef} />;
}
