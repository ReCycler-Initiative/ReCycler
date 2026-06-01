import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useMessages } from "@/i18n/locale-provider";
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
  const messages = useMessages();
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
        messages.datasourceEditor.connectionError
      );
    }
  };

  // Submit – sallitaan vain jos yhteystesti on onnistunut
  const onSubmit = (values: ConnectorFormValues) => {
    if (connectionStatus !== "success") {
      // Voit korvata tämän toastilla tms.
      alert(messages.datasourceEditor.testBeforeStart);
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
                {messages.datasourceEditor.connectionSettingsTitle}
              </h2>
              <p className="text-sm text-gray-500">
                {messages.datasourceEditor.connectionSettingsDescription}
              </p>

              <div className="text-xs">
                {connectionStatus === "idle" && (
                  <span className="text-gray-500">
                    {messages.datasourceEditor.notTested}
                  </span>
                )}
                {connectionStatus === "testing" && (
                  <span className="text-blue-700">
                    {messages.datasourceEditor.testingConnection}
                  </span>
                )}
                {connectionStatus === "success" && (
                  <span className="rounded-full bg-green-50 px-2 py-1 text-[11px] font-medium text-green-700">
                    {messages.datasourceEditor.connectionOk}
                  </span>
                )}
                {connectionStatus === "error" && (
                  <span className="rounded-full bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700">
                    {messages.datasourceEditor.connectionFailed}
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
                  ? messages.datasourceEditor.testing
                  : messages.datasourceEditor.testConnection}
              </Button>
              <Button type="submit" size="sm" className="min-w-[160px]">
                {messages.datasourceEditor.startAndValidate}
              </Button>
            </div>
          </div>

          {/* Yhdistimen kentät */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {messages.datasourceEditor.connectorName}
              </label>
              <input
                type="text"
                placeholder="Recycler 4.0 API"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm 
                             focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">{messages.datasourceEditor.status}</label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm 
                             focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                defaultValue="Luonnos"
              >
                <option>{messages.datasourceEditor.draft}</option>
                <option>{messages.datasourceEditor.active}</option>
                <option>{messages.datasourceEditor.disabled}</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                {messages.datasourceEditor.url}
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
                {messages.datasourceEditor.authentication}
              </label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm 
                             focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              >
                <option>{messages.datasourceEditor.apiKeyOption}</option>
                <option>{messages.datasourceEditor.bearerOption}</option>
                <option>{messages.datasourceEditor.basicAuthOption}</option>
                <option>{messages.datasourceEditor.noAuthOption}</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                {messages.datasourceEditor.apiKey}
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
                {messages.datasourceEditor.fieldMappingsTitle}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {messages.datasourceEditor.fieldMappingsDescription}
              </p>
            </div>

            {mappingDisabled && (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600">
                {messages.datasourceEditor.testBeforeMappings}
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
                  {messages.datasourceEditor.coordinatesSection}
                </h3>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {messages.datasourceEditor.coordinateSystem}
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
                    {messages.datasourceEditor.coordinateSystemHelp}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {messages.datasourceEditor.xField}
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
                      {messages.datasourceEditor.yField}
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
                    {messages.datasourceEditor.geometryType}
                  </label>
                  <select
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm 
                               focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    defaultValue="point"
                  >
                    <option value="point">{messages.datasourceEditor.pointOption}</option>
                    {/* myöhemmin: LineString, Polygon jne. */}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    {messages.datasourceEditor.geometryHelp}
                  </p>
                </div>
              </div>

              {/* Kohdetyyppi */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  {messages.datasourceEditor.locationTypeSection}
                </h3>
                <label className="text-sm font-medium text-gray-700">
                  {messages.datasourceEditor.typeField}
                </label>
                <input
                  type="text"
                  placeholder="type (oletus: collectionspot)"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm 
                             focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {messages.datasourceEditor.typeAttributes}
                  </label>
                  <input
                    type="text"
                    placeholder="material, fraction, containerType..."
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm 
                               focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {messages.datasourceEditor.typeAttributesHelp}
                  </p>
                </div>
              </div>

              {/* Perustiedot */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  {messages.datasourceEditor.basicInfoSection}
                </h3>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {messages.datasourceEditor.nameField}
                  </label>
                  <input
                    type="text"
                    placeholder="name"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm 
                               focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {messages.datasourceEditor.nameFieldHelp}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    {messages.datasourceEditor.addressField}
                  </label>
                  <input
                    type="text"
                    placeholder="address.full"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm 
                               focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {messages.datasourceEditor.addressFieldHelp}
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
                {messages.datasourceEditor.filtersTitle}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {messages.datasourceEditor.filtersDescription}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addFilter}
              disabled={mappingDisabled}
            >
              {messages.datasourceEditor.addFilter}
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
                      {messages.datasourceEditor.filterName}
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
                      {messages.datasourceEditor.sourceField}
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
                      {messages.datasourceEditor.icon}
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
              {filters.length} {messages.datasourceEditor.filtersDefined}
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
                  ? messages.datasourceEditor.testing
                  : messages.datasourceEditor.testConnection}
              </Button>

              <Button type="submit" size="lg" className="w-full lg:w-auto">
                {messages.datasourceEditor.startAndValidate}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Form>
  );
};
