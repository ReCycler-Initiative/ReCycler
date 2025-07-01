# ETL process for Vercel
#!/bin/bash

# Perform the DELETE request
curl -X DELETE "https://re-cycler-three.vercel.app/api/etl/collection_spots"

# Function to perform POST requests in the specified range
perform_post_requests() {
  local pageSize=5
  local start=$1
  local end=$2
  for ((i=start; i<=end; i+=pageSize)); do
    from=$i
    to=$((i + pageSize - 1))
    curl -X POST "https://re-cycler-three.vercel.app/api/etl/collection_spots?from=$from&to=$to"
  done
}

# Perform POST requests in the specified range
perform_post_requests 1 200
