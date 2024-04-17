import { useControl } from "react-map-gl";

class ControlScaffoldingClass {
  [x: string]: any;

  onAdd(map: any) {
    this._map = map;
    this._container = document.createElement("button");
    this._container.className =
      "mapboxgl-ctrl border border-gray-400 bg-white text-black px-2 py-1 rounded-md";
    this._container.textContent = "Custom control";
    this._container.onclick = () => alert("Button clicked");
    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

export function ControlScaffold() {
  useControl(() => new ControlScaffoldingClass() as any);

  return null;
}
