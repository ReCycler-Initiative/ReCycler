const MAPBOX_API_BASE_URL = "https://api.mapbox.com/search/geocode/v6";
const MAPBOX_SEARCH_TYPES = "address,postcode,place,locality,neighborhood";
export type MapboxAddressResult = {
	address: string;
	postalCode: string;
	postOffice: string;
	longitude: number;
	latitude: number;
	label: string;
};

type MapboxFeature = {
	geometry?: {
		coordinates?: [number, number];
	};
	properties?: {
		coordinates?: {
			longitude?: number;
			latitude?: number;
		};
		full_address?: string;
		context?: {
			postcode?: { name?: string };
			place?: { name?: string };
			locality?: { name?: string };
		};
	};
	place_formatted?: string;
	name?: string;
};

type MapboxResponse = {
	features?: MapboxFeature[];
};

const getMapboxToken = () => {
	const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
	if (!token) {
		throw new Error("Missing Mapbox token");
	}
	return token;
};

const mapFeatureToAddressResult = (
	feature: MapboxFeature
): MapboxAddressResult | null => {
	const coordinates = feature.properties?.coordinates;
	const fallbackCoordinates = feature.geometry?.coordinates;
	const longitude = coordinates?.longitude ?? fallbackCoordinates?.[0];
	const latitude = coordinates?.latitude ?? fallbackCoordinates?.[1];

	if (typeof longitude !== "number" || typeof latitude !== "number") {
		return null;
	}

	const address =
		feature.properties?.full_address ??
		feature.place_formatted ??
		feature.name ??
		"";
	const postalCode = feature.properties?.context?.postcode?.name ?? "";
	const postOffice =
		feature.properties?.context?.place?.name ??
		feature.properties?.context?.locality?.name ??
		"";

	return {
		address,
		postalCode,
		postOffice,
		longitude,
		latitude,
		label: [address, postalCode, postOffice].filter(Boolean).join(", "),
	};
};

export const searchMapboxAddresses = async (
	query: string,
	language: string
): Promise<MapboxAddressResult[]> => {
	const trimmedQuery = query.trim();
	if (!trimmedQuery) return [];

	const params = new URLSearchParams({
		access_token: getMapboxToken(),
		types: MAPBOX_SEARCH_TYPES,
		language,
		country: "fi",
		limit: "5",
	});

	const response = await fetch(
		`${MAPBOX_API_BASE_URL}/forward?q=${encodeURIComponent(trimmedQuery)}&${params.toString()}`,
		{ cache: "no-store" }
	);

	if (!response.ok) {
		throw new Error(`Mapbox forward geocoding failed with ${response.status}`);
	}

	const data = (await response.json()) as MapboxResponse;
	return (data.features ?? [])
		.map(mapFeatureToAddressResult)
		.filter((result): result is MapboxAddressResult => result !== null);
};

export const reverseGeocodeMapbox = async (
	longitude: number,
	latitude: number,
	language: string
): Promise<MapboxAddressResult | null> => {
	const params = new URLSearchParams({
		access_token: getMapboxToken(),
		types: MAPBOX_SEARCH_TYPES,
		language,
		limit: "1",
	});

	const response = await fetch(
		`${MAPBOX_API_BASE_URL}/reverse?longitude=${encodeURIComponent(String(longitude))}&latitude=${encodeURIComponent(String(latitude))}&${params.toString()}`,
		{ cache: "no-store" }
	);

	if (!response.ok) {
		throw new Error(`Mapbox reverse geocoding failed with ${response.status}`);
	}

	const data = (await response.json()) as MapboxResponse;
	return mapFeatureToAddressResult(data.features?.[0] ?? {});
};
