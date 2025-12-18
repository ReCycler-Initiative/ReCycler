import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useState } from "react";
import { useForm } from "react-hook-form";

type FilterRow = {
  id: number;
  label: string;
  attribute: string;
  icon: string;
};

type ConnectorFormValues = {
  name?: string;
};

type ConnectionStatus = "idle" | "testing" | "success" | "error";

export const DataSourceEditor = () => {
  const form = useForm<ConnectorFormValues>();

  const [filters, setFilters] = useState<FilterRow[]>([
    { id: 1, label: "Materiaali", attribute: "material", icon: "tag" },
  ]);

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("idle");
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // Lisää uusi suodatinkenttä
  const addFilter = () => {
    setFilters((prev) => [
      ...prev,
      { id: Date.now(), label: "", attribute: "", icon: "tag" },
    ]);
  };

  // Poista suodatinkenttä
  const removeFilter = (id: number) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  };

  // Päivitä yksittäinen suodatinkentän arvo
  const updateFilter = (
    id: number,
    field: keyof Omit<FilterRow, "id">,
    value: string
  ) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  // Testaa yhteys datalähteeseen
  const handleTestConnection = async () => {
    setConnectionError(null);
    setConnectionStatus("testing");

    try {
      // TODO: korvaa oikealla API-kutsulla
      // Esim:
      // const res = await fetch("/api/connectors/test", { method: "POST", body: JSON.stringify({...}) });
      // if (!res.ok) throw new Error("Yhteys epäonnistui");

      // Mock: onnistunut testi
      setConnectionStatus("success");
    } catch (err) {
      setConnectionStatus("error");
      setConnectionError(
        "Yhteyden testaus epäonnistui. Tarkista URL, tunnistautuminen ja mahdolliset rajapintarajoitteet."
      );
    }
  };

  // Submit – sallitaan vain jos yhteystesti on onnistunut
  const onSubmit = (values: ConnectorFormValues) => {
    if (connectionStatus !== "success") {
      // Voit korvata tämän toastilla tms.
      alert("Testaa yhteys onnistuneesti ennen yhdistimen käynnistämistä.");
      return;
    }

    console.log("Käynnistetään yhdistin arvoilla:", values, filters);
    // TODO: kutsu backend /activate tms.
  };

  const mappingDisabled = connectionStatus !== "success";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-y-8 pb-24 lg:pb-0"
      >
        {/* ----------------------------- */}
        {/* YHDISTIMEN ASETUKSET          */}
        {/* ----------------------------- */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-medium text-gray-900">
                Yhdistimen asetukset
              </h2>
              <p className="text-sm text-gray-500">
                Määritä API-yhteys, tunnistautuminen ja yhdistimen perustiedot.
              </p>

              <div className="text-xs">
                {connectionStatus === "idle" && (
                  <span className="text-gray-500">
                    Yhteyttä ei ole vielä testattu.
                  </span>
                )}
                {connectionStatus === "testing" && (
                  <span className="text-blue-700">
                    Testataan yhteyttä datalähteeseen...
                  </span>
                )}
                {connectionStatus === "success" && (
                  <span className="rounded-full bg-green-50 px-2 py-1 text-[11px] font-medium text-green-700">
                    Yhteys OK – voit nyt määrittää kenttävastinnat ja
                    suodattimet.
                  </span>
                )}
                {connectionStatus === "error" && (
                  <span className="rounded-full bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700">
                    Yhteystesti epäonnistui – tarkista asetukset.
                  </span>
                )}
              </div>

              {connectionError && (
                <p className="mt-1 text-xs text-red-600">{connectionError}</p>
              )}
            </div>

            {/* Desktop-painikkeet */}
            <div className="flex gap-2 self-end md:self-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-w-[120px]"
                onClick={handleTestConnection}
                disabled={connectionStatus === "testing"}
              >
                {connectionStatus === "testing"
                  ? "Testataan..."
                  : "Testaa yhteys"}
              </Button>
              <Button type="submit" size="sm" className="min-w-[160px]">
                Käynnistä ja validoi yhdistin
              </Button>
            </div>
          </div>

          {/* Yhdistimen kentät */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                Yhdistimen nimi
              </label>
              <input
                type="text"
                placeholder="Recycler 4.0 API"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm 
                             focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Tila</label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm 
                             focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                defaultValue="Luonnos"
              >
                <option>Luonnos</option>
                <option>Aktiivinen</option>
                <option>Poissa käytöstä</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                HTTP-osoite (URL)
              </label>
              <input
                type="text"
                placeholder="https://api.example.com/collection-points"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm 
                             focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Tunnistautuminen
              </label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm 
                             focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option>API-avain</option>
                <option>Bearer-token</option>
                <option>Perusautentikointi (Basic auth)</option>
                <option>Ei mitään</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                API-avain / token
              </label>
              <input
                type="password"
                placeholder="•••••••••••••"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm 
                             focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>
          </div>
        </section>

        {/* ----------------------------- */}
        {/* KENTTÄVASTINNAT                */}
        {/* ----------------------------- */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Kenttävastinnat
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Määritä paikkatiedon koordinaatit, kohteen tyyppi ja
                perustiedot.
              </p>
            </div>

            {mappingDisabled && (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600">
                Testaa yhteys ennen kenttävastintojen määrittämistä
              </span>
            )}
          </div>

          <fieldset
            disabled={mappingDisabled}
            className={mappingDisabled ? "mt-6 opacity-60" : "mt-6"}
          >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Koordinaattijärjestelmä ja koordinaatit */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Määritä koordinaattijärjestelmä ja koordinaatit
                </h3>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Koordinaattijärjestelmä (EPSG)
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm 
                               focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    defaultValue="EPSG:4326"
                  >
                    <option value="EPSG:4326">WGS84 (EPSG:4326)</option>
                    <option value="EPSG:3067">
                      ETRS89 / TM35FIN (EPSG:3067)
                    </option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Valitse koordinaattijärjestelmä, jonka mukaisia alla olevat
                    koordinaattikentät ovat.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      X-koordinaatin kenttä
                    </label>
                    <input
                      type="text"
                      placeholder="location.x"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm 
                                 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Y-koordinaatin kenttä
                    </label>
                    <input
                      type="text"
                      placeholder="location.y"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm 
                                 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Geometriatyyppi
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm 
                               focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    defaultValue="point"
                  >
                    <option value="point">Piste (point)</option>
                    {/* myöhemmin: LineString, Polygon jne. */}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Aluksi tuetaan vain pistekohteita. Muita geometriatyyppejä
                    voidaan lisätä myöhemmin.
                  </p>
                </div>
              </div>

              {/* Kohdetyyppi */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Kohdetyyppi
                </h3>
                <label className="text-sm font-medium text-gray-700">
                  Tyyppikenttä
                </label>
                <input
                  type="text"
                  placeholder="type (oletus: collectionspot)"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm 
                             focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Tyyppikohtaiset attribuutit
                  </label>
                  <input
                    type="text"
                    placeholder="material, fraction, containerType..."
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm 
                               focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Esimerkiksi materiaalit, fraktiot tai astiatyyppi.
                  </p>
                </div>
              </div>

              {/* Perustiedot */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Perustiedot
                </h3>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Nimikenttä
                  </label>
                  <input
                    type="text"
                    placeholder="name"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm 
                               focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Kenttä, josta luetaan kohteen nimi.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Osoitekenttä
                  </label>
                  <input
                    type="text"
                    placeholder="address.full"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm 
                               focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Esimerkiksi yhdistetty osoite tai osoiteobjektin polku.
                  </p>
                </div>
              </div>
            </div>
          </fieldset>
        </section>

        {/* ----------------------------- */}
        {/* SUODATTIMET                   */}
        {/* ----------------------------- */}
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Suodattimet ja suodatettavat ominaisuudet
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Määritä, mitä arvoja käyttöliittymä voi käyttää suodattimina.
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFilter}
              disabled={mappingDisabled}
            >
              + Lisää suodatin
            </Button>
          </div>

          <fieldset
            disabled={mappingDisabled}
            className={mappingDisabled ? "mt-6 opacity-60" : "mt-6"}
          >
            {/* Suodatinlista */}
            <div className="space-y-3">
              {filters.map((filter) => (
                <div
                  key={filter.id}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm 
                               md:grid-cols-[minmax(0,2fr),minmax(0,2fr),minmax(0,1.5fr),auto]"
                >
                  <div>
                    <label className="text-xs font-medium text-gray-600">
                      Suodattimen nimi
                    </label>
                    <input
                      type="text"
                      value={filter.label}
                      onChange={(e) =>
                        updateFilter(filter.id, "label", e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm 
                                   focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600">
                      Lähdekenttä
                    </label>
                    <input
                      type="text"
                      value={filter.attribute}
                      onChange={(e) =>
                        updateFilter(filter.id, "attribute", e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm 
                                   focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600">
                      Ikoni
                    </label>
                    <input
                      type="text"
                      value={filter.icon}
                      onChange={(e) =>
                        updateFilter(filter.id, "icon", e.target.value)
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm shadow-sm 
                                   focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>

                  {/* Poista-painike */}
                  <div className="flex items-end justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                      onClick={() => removeFilter(filter.id)}
                    >
                      ✕
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </fieldset>
        </section>

        {/* ----------------------------- */}
        {/* ALAPALKIN TOIMINNOT (MOBIILI) */}
        {/* ----------------------------- */}
        <div
          className="fixed bottom-0 left-0 right-0 border-t border-gray-300 bg-white p-4 
                          lg:static lg:border-none lg:bg-transparent lg:p-0"
        >
          <div
            className="mx-auto flex max-w-4xl flex-col gap-y-3 
                            lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="text-sm text-gray-600">
              {filters.length} suodatinta määritetty
            </div>

            <div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full lg:w-auto"
                onClick={handleTestConnection}
                disabled={connectionStatus === "testing"}
              >
                {connectionStatus === "testing"
                  ? "Testataan..."
                  : "Testaa yhteys"}
              </Button>

              <Button type="submit" size="lg" className="w-full lg:w-auto">
                Käynnistä ja validoi yhdistin
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};
