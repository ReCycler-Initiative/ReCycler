# Recycler API

## Create environment

```bash
python3 -m venv .venv
```

## Install dependencies


```bash
pip3 install -r requirements.txt
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
export api_key=kierratys_api_key && python3 etl-collectionspots.py
```

