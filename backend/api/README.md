# Recycler API

## Create environment

```bash
python3 -m venv .venv
```

## Load environment

```bash
. .venv/bin/activate
```

## Install dependencies

```bash
pip3 install -r requirements.txt
```

## Run API

```bash
python3 -m flask --app app run
```

# Run ETLs

```bash
export api_key=kierratys_api_key && python3 etl-collectionspots.py
```
