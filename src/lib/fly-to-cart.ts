export function triggerFlyToCartAnimation(sourceImgElement: HTMLElement | null) {
  if (!sourceImgElement || typeof window === "undefined") return;

  // Find target bottom-right floating bag button
  const targetBagElement = document.getElementById("floating-bag-btn");

  const sourceRect = sourceImgElement.getBoundingClientRect();
  const targetRect = targetBagElement
    ? targetBagElement.getBoundingClientRect()
    : {
        left: window.innerWidth - 130,
        top: window.innerHeight - 70,
        width: 110,
        height: 48,
      };

  // Create a floating clone of the product image card
  const clone = sourceImgElement.cloneNode(true) as HTMLElement;

  // Initial clone styles matching source element location
  clone.style.position = "fixed";
  clone.style.left = `${sourceRect.left}px`;
  clone.style.top = `${sourceRect.top}px`;
  clone.style.width = `${sourceRect.width}px`;
  clone.style.height = `${sourceRect.height}px`;
  clone.style.zIndex = "99999";
  clone.style.pointerEvents = "none";
  clone.style.borderRadius = "24px";
  clone.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.2)";
  
  // Direct fast ease-out transition (500ms) for instant entry
  const DURATION = 500;
  clone.style.transition = `transform ${DURATION}ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity ${DURATION}ms cubic-bezier(0.4, 0, 0.2, 1), border-radius ${DURATION}ms ease`;
  clone.style.transformOrigin = "center center";

  document.body.appendChild(clone);

  // Force DOM reflow before starting animation
  void clone.offsetHeight;

  // Calculate exact position delta to the center of the bag button
  const deltaX = targetRect.left + targetRect.width / 2 - (sourceRect.left + sourceRect.width / 2);
  const deltaY = targetRect.top + targetRect.height / 2 - (sourceRect.top + sourceRect.height / 2);
  const scale = 0.04;

  // Direct fly-into-bag transform without overshooting
  clone.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scale})`;
  clone.style.opacity = "0";
  clone.style.borderRadius = "50%";

  // Trigger pulse effect on bag icon at the EXACT INSTANT the product clone enters the bag
  setTimeout(() => {
    if (clone.parentNode) {
      clone.parentNode.removeChild(clone);
    }

    // Instant pop/pulse animation on the bag button
    if (targetBagElement) {
      targetBagElement.classList.add("scale-125", "ring-4", "ring-gold/60", "bg-gold", "text-brand-soft");
      setTimeout(() => {
        targetBagElement.classList.remove("scale-125", "ring-4", "ring-gold/60", "bg-gold", "text-brand-soft");
      }, 300);
    }
  }, DURATION - 20); // 480ms: perfectly synced with exact entry time
}
