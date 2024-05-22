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
    icon.src =
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLXJlY3ljbGUiPjxwYXRoIGQ9Ik03IDE5SDQuODE1YTEuODMgMS44MyAwIDAgMS0xLjU3LS44ODEgMS43ODUgMS43ODUgMCAwIDEtLjAwNC0xLjc4NEw3LjE5NiA5LjUiLz48cGF0aCBkPSJNMTEgMTloOC4yMDNhMS44MyAxLjgzIDAgMCAwIDEuNTU2LS44OSAxLjc4NCAxLjc4NCAwIDAgMCAwLTEuNzc1bC0xLjIyNi0yLjEyIi8+PHBhdGggZD0ibTE0IDE2LTMgMyAzIDMiLz48cGF0aCBkPSJNOC4yOTMgMTMuNTk2IDcuMTk2IDkuNSAzLjEgMTAuNTk4Ii8+PHBhdGggZD0ibTkuMzQ0IDUuODExIDEuMDkzLTEuODkyQTEuODMgMS44MyAwIDAgMSAxMS45ODUgM2ExLjc4NCAxLjc4NCAwIDAgMSAxLjU0Ni44ODhsMy45NDMgNi44NDMiLz48cGF0aCBkPSJtMTMuMzc4IDkuNjMzIDQuMDk2IDEuMDk4IDEuMDk3LTQuMDk2Ii8+PC9zdmc+";
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
}

type SelectedMaterialsControlProps = {
  amount: number;
  onClick: () => void;
};

export function SelectedMaterialsControl(props: SelectedMaterialsControlProps) {
  useControl(() => new SelectedMaterialsControlClass(props) as any, {
    position: "bottom-right"
  });

  return null;
}
