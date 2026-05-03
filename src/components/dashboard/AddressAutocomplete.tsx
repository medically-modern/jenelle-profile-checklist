import { useEffect, useRef, useState } from "react";

let mapsLoaded = false;
let mapsLoading = false;
const loadCallbacks: (() => void)[] = [];

async function loadGooglePlaces(): Promise<void> {
  if (mapsLoaded) return;
  if (mapsLoading) {
    return new Promise((resolve) => { loadCallbacks.push(resolve); });
  }
  mapsLoading = true;
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  if (!key) {
    console.warn("VITE_GOOGLE_MAPS_API_KEY is not set — address autocomplete disabled");
    mapsLoading = false;
    return;
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.onload = () => {
      mapsLoaded = true;
      mapsLoading = false;
      loadCallbacks.forEach((cb) => cb());
      loadCallbacks.length = 0;
      resolve();
    };
    script.onerror = () => {
      mapsLoading = false;
      reject(new Error("Google Maps JS SDK failed to load"));
    };
    document.head.appendChild(script);
  });
}

/** Strip "-NNNN" off any 5-digit zip in the string. We only ever store 5-digit zips. */
export function stripZipPlus4(addr: string): string {
  return addr.replace(/(\b\d{5})-\d{4}\b/g, "$1");
}

/** Build an address from PlaceResult components, guaranteeing the zip is included. */
function buildFullAddress(place: google.maps.places.PlaceResult): string {
  const components = place.address_components || [];
  const get = (type: string) => components.find((c) => c.types.includes(type))?.long_name || "";
  const streetNumber = get("street_number");
  const route = get("route");
  const city = get("locality") || get("sublocality_level_1") || get("administrative_area_level_3");
  const state = components.find((c) => c.types.includes("administrative_area_level_1"))?.short_name || "";
  const zip = get("postal_code");
  const street = [streetNumber, route].filter(Boolean).join(" ");
  const parts = [street, city, [state, zip].filter(Boolean).join(" ")].filter(Boolean);
  return parts.join(", ");
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
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const onChangeRef = useRef(onChange);
  const lastSubmittedRef = useRef<string>(value);
  const [ready, setReady] = useState(mapsLoaded);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  // Sync external value → input (e.g. switching patients)
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== value) {
      inputRef.current.value = value ?? "";
      lastSubmittedRef.current = value ?? "";
    }
  }, [value]);

  useEffect(() => {
    loadGooglePlaces()
      .then(() => {
        // If no API key was configured, loadGooglePlaces resolves without
        // actually loading the SDK. Only mark ready when google.maps.places
        // is actually available so the next effect doesn't crash.
        if (typeof window !== "undefined" &&
            (window as unknown as { google?: { maps?: { places?: unknown } } }).google?.maps?.places) {
          setReady(true);
        }
      })
      .catch((err) => console.error("Failed to load Google Places:", err));
  }, []);

  useEffect(() => {
    if (!ready || !inputRef.current || autocompleteRef.current) return;
    if (typeof window === "undefined" ||
        !(window as unknown as { google?: { maps?: { places?: unknown } } }).google?.maps?.places) {
      return;
    }
    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: "us" },
      types: ["address"],
      fields: ["address_components", "formatted_address", "geometry"],
    });
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place) return;
      let addr = "";
      if ((place.address_components || []).length > 0) {
        addr = buildFullAddress(place);
      } else {
        addr = place.formatted_address || inputRef.current?.value || "";
      }
      if (!addr) return;
      addr = stripZipPlus4(addr);
      if (inputRef.current) inputRef.current.value = addr;
      lastSubmittedRef.current = addr;
      let lat = 0, lng = 0;
      if (place.geometry?.location) {
        lat = place.geometry.location.lat();
        lng = place.geometry.location.lng();
      }
      onChangeRef.current({ address: addr, lat, lng });
    });
    autocompleteRef.current = autocomplete;
  }, [ready]);

  // On blur, propagate manual edits if the user typed without picking a suggestion.
  const handleBlur = () => {
    if (!inputRef.current) return;
    const current = stripZipPlus4(inputRef.current.value);
    if (current !== inputRef.current.value) inputRef.current.value = current;
    if (current !== lastSubmittedRef.current) {
      lastSubmittedRef.current = current;
      onChangeRef.current({ address: current, lat: 0, lng: 0 });
    }
  };

  return (
    <input
      ref={inputRef}
      className={className ?? "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"}
      defaultValue={value}
      placeholder={placeholder ?? "Start typing address…"}
      onBlur={handleBlur}
    />
  );
}
