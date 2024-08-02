# Recycler API

## How to get started

### Create environment

**_NOTE: Only needed on the initial run_**

```bash
python3 -m venv .venv
```

### Load environment

```bash
. .venv/bin/activate
```

### Install dependencies

```bash
./install.sh
```

### Initialize database and install PostGIS

**_NOTE: Only needed on the initial run_**

```bash
./init_db.sh
```

## Run ETLs

Populate the database with Kierratys.info data

```bash
./etl.sh
```

## Start API

```bash
./start.sh
```

## Test API

```bash
http://127.0.0.1:5000/api/collection_spots
```
