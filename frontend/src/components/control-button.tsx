import { cn } from "@/utils/shadcn";
import { useControl } from "react-map-gl";

class MapStyleControlClass {
  [x: string]: any;

  constructor(props: MapStyleControlProps) {
    this._props = props;
  }

  onAdd(map: any) {
    this._map = map;
    this._container = document.createElement("div");
    this._container.className =
      "mapboxgl-ctrl mapboxgl-ctrl-group items-center justify-center";

    const button = document.createElement("button");
    button.className = "flex";

    const icon = document.createElement("img");
    icon.className = "mapboxgl-ctrl-icon p-1";
    icon.src =
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWdsb2JlIj48Y2lyY2xlIGN4PSIxMiIgY3k9IjEyIiByPSIxMCIvPjxwYXRoIGQ9Ik0xMiAyYTE0LjUgMTQuNSAwIDAgMCAwIDIwIDE0LjUgMTQuNSAwIDAgMCAwLTIwIi8+PHBhdGggZD0iTTIgMTJoMjAiLz48L3N2Zz4=";
    button.appendChild(icon);
    button.onclick = () => {
      this._selected = !this._selected;
      this._props.onToggle(this._selected);
    };

    this._container.appendChild(button);

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }
}

type MapStyleControlProps = {
  onToggle: (selected: boolean) => void;
  selected?: boolean;
};

export function MapStyleControl(props: MapStyleControlProps) {
  useControl(() => new MapStyleControlClass(props) as any);

  return null;
}
