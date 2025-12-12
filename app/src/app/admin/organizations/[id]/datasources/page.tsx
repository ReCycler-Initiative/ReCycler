"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { PageTemplate } from "@/components/admin/page-template";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";

type FilterRow = {
  id: number;
  label: string;
  attribute: string;
  icon: string;
};

type ConnectorFormValues = {
  name?: string;
};

const DataSourcesPage = () => {
  const form = useForm<ConnectorFormValues>();

  const [filters, setFilters] = useState<FilterRow[]>([
    { id: 1, label: "Material", attribute: "material", icon: "tag" },
  ]);

  // Add a new filter row to the list
  const addFilter = () => {
    setFilters((prev) => [
      ...prev,
      { id: Date.now(), label: "", attribute: "", icon: "tag" },
    ]);
  };

  // Remove an existing filter row
  const removeFilter = (id: number) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  };

  // Update a single field on a filter row
  const updateFilter = (
    id: number,
    field: keyof Omit<FilterRow, "id">,
    value: string
  ) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  // Mock submit handler – replace with actual logic later
  const onSubmit = (values: ConnectorFormValues) => {
    console.log("Submitted:", values, filters);
  };

  return (
    <PageTemplate title="Data sources">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-y-8 pb-24 lg:pb-0"
        >
          {/* ----------------------------- */}
          {/* CONNECTOR CONFIGURATION BLOCK */}
          {/* ----------------------------- */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Connector configuration
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Provide API credentials and define the connector details.
                </p>
              </div>

              {/* Desktop action buttons */}
              <div className="hidden gap-2 lg:flex">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-w-[120px]"
                >
                  Test connection
                </Button>
                <Button type="submit" size="sm" className="min-w-[140px]">
                  Start &amp; validate
                </Button>
              </div>
            </div>

            {/* Connector input fields */}
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Connector name
                </label>
                <input
                  type="text"
                  placeholder="Recycler 4.0 API"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm 
                             focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm 
                             focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option>Draft</option>
                  <option>Active</option>
                  <option>Disabled</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  HTTP URL
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
                  Authentication
                </label>
                <select
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm 
                             focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                >
                  <option>API key</option>
                  <option>Bearer token</option>
                  <option>Basic auth</option>
                  <option>None</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  API key / token
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
          {/* FIELD MAPPING BLOCK           */}
          {/* ----------------------------- */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium text-gray-900">Field mapping</h2>
            <p className="mt-1 text-sm text-gray-500">
              Map location fields, object type, and essential metadata.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
              {/* Location fields */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Location (WGS84)
                </h3>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Latitude field
                  </label>
                  <input
                    type="text"
                    placeholder="location.lat"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm 
                               focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Longitude field
                  </label>
                  <input
                    type="text"
                    placeholder="location.lon"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm 
                               focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* Object type */}

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Object type
                </h3>
                <label className="text-sm font-medium text-gray-700">
                  Type field
                </label>
                <input
                  type="text"
                  placeholder="type (default: collectionspot)"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm 
                             focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Attributes by type
                  </label>
                  <input
                    type="text"
                    placeholder="material, fraction, containerType..."
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm 
                               focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>

              {/* Basic fields */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Basic information
                </h3>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Name field
                  </label>
                  <input
                    type="text"
                    placeholder="name"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm 
                               focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Address field
                  </label>
                  <input
                    type="text"
                    placeholder="address.full"
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm 
                               focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ----------------------------- */}
          {/* FILTER MANAGEMENT BLOCK       */}
          {/* ----------------------------- */}
          <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  Filters &amp; filterable attributes
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Define which values can be used by the UI as filters.
                </p>
              </div>

              <Button type="button" variant="outline" size="sm" onClick={addFilter}>
                + Add filter
              </Button>
            </div>

            {/* Filter list */}
            <div className="mt-6 space-y-3">
              {filters.map((filter) => (
                <div
                  key={filter.id}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm 
                             md:grid-cols-[minmax(0,2fr),minmax(0,2fr),minmax(0,1.5fr),auto]"
                >
                  <div>
                    <label className="text-xs font-medium text-gray-600">
                      Filter label
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
                      Source attribute
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
                      Icon
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

                  {/* Remove button */}
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
          </section>

          {/* ----------------------------- */}
          {/* BOTTOM ACTION BAR (MOBILE)    */}
          {/* ----------------------------- */}
          <div className="fixed bottom-0 left-0 right-0 border-t border-gray-300 bg-white p-4 
                          lg:static lg:border-none lg:bg-transparent lg:p-0">
            <div className="mx-auto flex max-w-4xl flex-col gap-y-3 
                            lg:flex-row lg:items-center lg:justify-between">
              <div className="text-sm text-gray-600">
                {filters.length} filters defined
              </div>

              <div className="flex w-full flex-col gap-2 lg:w-auto lg:flex-row">
                <Button type="button" variant="outline" size="lg" className="w-full lg:w-auto">
                  Test connection
                </Button>

                <Button type="submit" size="lg" className="w-full lg:w-auto">
                  Start &amp; validate connector
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </PageTemplate>
  );
};

export default DataSourcesPage;
