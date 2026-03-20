import { useEffect, useRef } from "react";
import { useControl } from "react-map-gl";

class SelectedMaterialsControlClass {
  [x: string]: any;

  constructor(props: SelectedMaterialsControlProps) {
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

    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">` +
      `<path d="M3 5h18l-7 8v5l-4 2v-7L3 5z"/>` +
      `</svg>`;
    icon.src = `data:image/svg+xml;base64,${btoa(svg)}`;
    button.appendChild(icon);
    button.onclick = () => {
      this._selected = !this._selected;
      this._props.onClick();
    };

    const span = document.createElement("span");
    span.style.position = "absolute";
    span.style.color = "white";
    span.style.top = "-10px";
    span.style.right = "-8px";
    span.style.backgroundColor = "black";
    span.style.height = "20px";
    span.style.display = "flex";
    span.style.alignItems = "center";
    span.style.justifyContent = "center";
    span.style.width = "20px";
    span.style.borderRadius = "100%";
    span.style.zIndex = "100000000";
    span.innerHTML = this._props.amount.toString();

    button.appendChild(span);

    this._container.appendChild(button);

    return this._container;
  }

  onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map = undefined;
  }

  onUpdate(props: SelectedMaterialsControlProps) {
    if (this._props.amount !== props.amount && this._container) {
      this._container.querySelector("span").innerHTML = props.amount.toString();
    }
    this._props = props;
  }
}

type SelectedMaterialsControlProps = {
  amount: number;
  onClick: () => void;
};

export function SelectedMaterialsControl(props: SelectedMaterialsControlProps) {
  const controlRef = useRef<SelectedMaterialsControlClass | null>(null);
  useControl(
    () => {
      const control = new SelectedMaterialsControlClass(props) as any;
      controlRef.current = control;
      return control;
    },
    {
      position: "bottom-right",
    }
  );

  useEffect(() => {
    if (controlRef.current) {
      const doUpdate = controlRef.current.onUpdate.bind(controlRef.current);
      doUpdate(props);
    }
  }, [props]);

  return null;
}
