"use client";

import { useEffect, useMemo, useState } from "react";

type InspectorBox = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type InspectorTarget = {
  box: InspectorBox;
  selector: string;
  blockId?: string;
  label: string;
};

function buildSelector(element: HTMLElement) {
  if (element.dataset.blockId) {
    return `[data-block-id="${element.dataset.blockId}"]`;
  }

  if (element.id) {
    return `#${element.id}`;
  }

  const className = [...element.classList].slice(0, 2).join(".");
  if (className) {
    return `${element.tagName.toLowerCase()}.${className}`;
  }

  return element.tagName.toLowerCase();
}

function getInspectableElement(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return null;
  }

  const blocked = target.closest("[data-inspector-ignore='true']");
  if (blocked) {
    return null;
  }

  return target.closest("div, section, article, aside, header, footer, main, nav") as HTMLElement | null;
}

export function DomInspector() {
  const [enabled, setEnabled] = useState(false);
  const [hovered, setHovered] = useState<InspectorTarget | null>(null);
  const [selected, setSelected] = useState<InspectorTarget | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onToggle = () => setEnabled((value) => !value);
    window.addEventListener("toggle-dom-inspector", onToggle);

    return () => {
      window.removeEventListener("toggle-dom-inspector", onToggle);
    };
  }, []);

  useEffect(() => {
    if (!enabled) {
      setHovered(null);
      setSelected(null);
      setCopied(false);
      return;
    }

    const onMove = (event: MouseEvent) => {
      const element = getInspectableElement(event.target);
      if (!element) {
        setHovered(null);
        return;
      }

      const rect = element.getBoundingClientRect();
      const nextTarget = {
        box: {
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        },
        selector: buildSelector(element),
        blockId: element.dataset.blockId || undefined,
        label: element.dataset.blockName || element.getAttribute("aria-label") || element.tagName.toLowerCase()
      };

      setHovered(nextTarget);
    };

    const onClick = async (event: MouseEvent) => {
      const element = getInspectableElement(event.target);
      if (!element) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      const rect = element.getBoundingClientRect();
      const nextTarget = {
        box: {
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        },
        selector: buildSelector(element),
        blockId: element.dataset.blockId || undefined,
        label: element.dataset.blockName || element.getAttribute("aria-label") || element.tagName.toLowerCase()
      };

      setSelected(nextTarget);

      const payload = nextTarget.blockId ?? nextTarget.selector;
      try {
        await navigator.clipboard.writeText(payload);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1400);
      } catch {
        setCopied(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setEnabled(false);
      }
    };

    document.addEventListener("mousemove", onMove, true);
    document.addEventListener("click", onClick, true);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousemove", onMove, true);
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [enabled]);

  const activeTarget = selected ?? hovered;

  const inspectorStyle = useMemo(() => {
    if (!activeTarget) {
      return undefined;
    }

    return {
      top: `${activeTarget.box.top}px`,
      left: `${activeTarget.box.left}px`,
      width: `${activeTarget.box.width}px`,
      height: `${activeTarget.box.height}px`
    };
  }, [activeTarget]);

  return (
    <>
      <button
        type="button"
        className={`slotcity-inspector-toggle ${enabled ? "is-active" : ""}`}
        onClick={() => setEnabled((value) => !value)}
        aria-label="Увімкнути піпетку"
        data-inspector-ignore="true"
      >
        ◌
        <span>Піпетка</span>
      </button>

      {enabled ? <div className="slotcity-inspector-scrim" data-inspector-ignore="true" /> : null}

      {enabled && activeTarget ? (
        <>
          <div className="slotcity-inspector-highlight" style={inspectorStyle} data-inspector-ignore="true" />
          <div className="slotcity-inspector-panel" data-inspector-ignore="true">
            <strong>{activeTarget.label}</strong>
            <span>{activeTarget.blockId ?? activeTarget.selector}</span>
            <small>{copied ? "Скопійовано" : "Клік по блоку копіює id або selector"}</small>
          </div>
        </>
      ) : null}
    </>
  );
}
