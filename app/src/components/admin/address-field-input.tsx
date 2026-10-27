"use client";

import { useState } from "react";
import { Loader2, LocateFixed } from "lucide-react";
import { useLocale, useMessages } from "@/i18n/locale-provider";
import {
  MapboxAddressResult,
  reverseGeocodeMapbox,
  searchMapboxAddresses,
} from "@/lib/mapbox-geocoding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Address field value: [street, postal code, post office] */
type AddressValues = [string, string, string];

const toAddressValues = (values: string[]): AddressValues => [
  values[0] ?? "",
  values[1] ?? "",
  values[2] ?? "",
];

const fromResult = (result: MapboxAddressResult): AddressValues => [
  result.street,
  result.postalCode,
  result.postOffice,
];

export const formatAddressValues = (values: string[]) =>
  [values[0], [values[1], values[2]].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");

export const AddressFieldInput = ({
  values,
  onChange,
  coordinates,
  onLocate,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  /** Current location coordinates, used for reverse geocoding */
  coordinates: { longitude: number; latitude: number } | null;
  /** Called with the coordinates of a selected search result */
  onLocate?: (lngLat: { longitude: number; latitude: number }) => void;
}) => {
  const { locale } = useLocale();
  const messages = useMessages();
  const current = toAddressValues(values);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MapboxAddressResult[]>([]);
  const [lookupMessage, setLookupMessage] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [pendingValues, setPendingValues] = useState<AddressValues | null>(null);

  const setPart = (index: 0 | 1 | 2, value: string) => {
    const next = [...current];
    next[index] = value;
    onChange(next);
  };

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      setLookupMessage(null);
      return;
    }

    setIsSearching(true);
    setLookupMessage(null);

    try {
      const found = await searchMapboxAddresses(query, locale);
      setResults(found);
      if (found.length === 0) {
        setLookupMessage(messages.adminLocationPanel.noAddressFound);
      }
    } catch {
      setResults([]);
      setLookupMessage(messages.adminLocationPanel.addressLookupFailed);
    } finally {
      setIsSearching(false);
    }
  };

  const selectResult = (result: MapboxAddressResult) => {
    onChange(fromResult(result));
    setQuery(result.label || result.address);
    setResults([]);
    setLookupMessage(null);
    onLocate?.({ longitude: result.longitude, latitude: result.latitude });
  };

  const resolveFromCoordinates = async () => {
    if (!coordinates) return;

    setIsResolving(true);
    setLookupMessage(null);
    setResults([]);

    try {
      const result = await reverseGeocodeMapbox(
        coordinates.longitude,
        coordinates.latitude,
        locale
      );
      if (!result) {
        setLookupMessage(messages.adminLocationPanel.noAddressFound);
        return;
      }
      // Ask before overwriting an address that has already been entered
      if (current.some(Boolean)) {
        setPendingValues(fromResult(result));
      } else {
        onChange(fromResult(result));
      }
    } catch {
      setLookupMessage(messages.adminLocationPanel.addressLookupFailed);
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                void handleSearch();
              }
            }}
            placeholder={messages.adminLocationPanel.addressSearchPlaceholder}
            aria-label={messages.adminLocationPanel.addressSearch}
          />
          <Button
            type="button"
            variant="outline"
            disabled={isSearching || !query.trim()}
            onClick={() => void handleSearch()}
          >
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              messages.adminLocationPanel.addressSearch
            )}
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full gap-2"
          disabled={isResolving || !coordinates}
          onClick={() => void resolveFromCoordinates()}
        >
          {isResolving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {messages.adminLocationPanel.resolvingAddress}
            </>
          ) : (
            <>
              <LocateFixed className="h-4 w-4" />
              {messages.adminLocationPanel.suggestAddressFromCoordinates}
            </>
          )}
        </Button>

        {lookupMessage && (
          <p className="text-xs text-muted-foreground">{lookupMessage}</p>
        )}

        {results.length > 0 && (
          <div className="rounded-md border border-gray-200 bg-white">
            {results.map((result) => (
              <button
                key={`${result.longitude}:${result.latitude}:${result.label}`}
                type="button"
                onClick={() => selectResult(result)}
                className="block w-full border-b border-gray-100 px-3 py-2 text-left text-sm last:border-b-0 hover:bg-gray-50"
              >
                {result.label || result.address}
              </button>
            ))}
          </div>
        )}
      </div>

      <Input
        value={current[0]}
        placeholder={messages.adminLocationPanel.address}
        aria-label={messages.adminLocationPanel.address}
        onChange={(e) => setPart(0, e.target.value)}
      />
      <div className="grid grid-cols-2 gap-2">
        <Input
          value={current[1]}
          placeholder={messages.adminLocationPanel.postalCode}
          aria-label={messages.adminLocationPanel.postalCode}
          onChange={(e) => setPart(1, e.target.value)}
        />
        <Input
          value={current[2]}
          placeholder={messages.adminLocationPanel.postOffice}
          aria-label={messages.adminLocationPanel.postOffice}
          onChange={(e) => setPart(2, e.target.value)}
        />
      </div>

      <Dialog
        open={!!pendingValues}
        onOpenChange={(open) => {
          if (!open) setPendingValues(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{messages.adminLocationPanel.updateAddressConfirmTitle}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">
              {messages.adminLocationPanel.updateAddressConfirmDescription}
            </p>
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3 space-y-1">
              <p className="font-medium">{pendingValues?.[0]}</p>
              <p className="text-muted-foreground">
                {[pendingValues?.[1], pendingValues?.[2]].filter(Boolean).join(" ")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingValues(null)}>
              {messages.editor.cancel}
            </Button>
            <Button
              onClick={() => {
                if (!pendingValues) return;
                onChange(pendingValues);
                setPendingValues(null);
              }}
            >
              {messages.adminLocationPanel.updateAddress}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
