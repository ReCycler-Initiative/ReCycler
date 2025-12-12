import { PageTemplate } from "@/components/admin/page-template";

const DataSourcesPage = () => {
  return (
    <PageTemplate title="Data sources">
      <p className="text-gray-600">
        This page contain connector creating process and attribute filter.
<br/>
<br/>
Connector Configuration<br/>
Provide API credentials and a valid API key for accessing the data source<br/>
Define the data source: specify the HTTP URL and the data schema<br/>
Fetch data from the configured source<br/>
Map location fields to latitude and longitude in WGS84 format<br/>
Define and map the object type; introduce a new type field (default is collectionspot, Recycler requires a new type); object types may have different attributes (currently materials)<br/>
Map basic information such as object name and address<br/>
Start and validate the connector<br/>
Define filters and assign an icon for each filter<br/>
Select relevant source attributes and configure them as filterable fields

      </p>
    </PageTemplate>
  );
};
export default DataSourcesPage;
