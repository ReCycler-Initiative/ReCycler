# Recycler API

## Create environment

```bash
python3 -m venv .venv
```

## Load environment

```bash
. .venv/bin/activate
```

## Run API

```bash
python3 -m flask --app hello run
```

# Run ETLs

```bash
KIERRATYS_API_KEY=<YOUR_API_KEY_HERE> python3 etl-collectionspots.py && python3 etl-materials.py
```

