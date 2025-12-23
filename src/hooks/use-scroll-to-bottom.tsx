import { useCallback, useEffect, useRef, useState } from "react";

export function useScrollToBottom() {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const isAtBottomRef = useRef(true);
  const isUserScrollingRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    isAtBottomRef.current = isAtBottom;
  }, [isAtBottom]);

  const checkIfAtBottom = useCallback(() => {
    if (!containerRef.current) {
      return true;
    }
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    return scrollTop + clientHeight >= scrollHeight - 100;
  }, []);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (!containerRef.current) {
      return;
    }
    containerRef.current.scrollTo({
      top: containerRef.current.scrollHeight,
      behavior,
    });
  }, []);

  // Handle user scroll events
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      // Mark as user scrolling
      isUserScrollingRef.current = true;
      clearTimeout(scrollTimeout);

      // Update isAtBottom state
      const atBottom = checkIfAtBottom();
      setIsAtBottom(atBottom);
      isAtBottomRef.current = atBottom;

      // Reset user scrolling flag after scroll ends
      scrollTimeout = setTimeout(() => {
        isUserScrollingRef.current = false;
      }, 150);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [checkIfAtBottom]);

  // Auto-scroll when content changes
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const scrollIfNeeded = () => {
      // Only auto-scroll if user was at bottom and isn't actively scrolling
      if (isAtBottomRef.current && !isUserScrollingRef.current) {
        requestAnimationFrame(() => {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "instant",
          });
          setIsAtBottom(true);
          isAtBottomRef.current = true;
        });
      }
    };

    // Use ResizeObserver for efficient size change detection
    const resizeObserver = new ResizeObserver(scrollIfNeeded);

    // Observe the container itself (in case viewport changes)
    resizeObserver.observe(container);

    // Observe all current direct children (where the content lives)
    for (const child of container.children) {
      resizeObserver.observe(child);
    }

    // Use MutationObserver only to detect structure changes (added/removed children)
    // We avoid 'subtree: true' and 'characterData: true' to prevent layout thrashing on every text update
    const mutationObserver = new MutationObserver((mutations) => {
      let shouldScroll = false;

      for (const mutation of mutations) {
        if (mutation.type === "childList") {
          // Attach ResizeObserver to new children
          mutation.addedNodes.forEach((node) => {
            if (node instanceof Element) {
              resizeObserver.observe(node);
            }
          });

          // Detach ResizeObserver from removed children
          mutation.removedNodes.forEach((node) => {
            if (node instanceof Element) {
              resizeObserver.unobserve(node);
            }
          });

          shouldScroll = true;
        }
      }

      // Check scroll once after processing all mutations to avoid layout thrashing in loop
      if (shouldScroll) {
        scrollIfNeeded();
      }
    });

    mutationObserver.observe(container, {
      childList: true,
      subtree: false, // PERFORMANCE: Do not observe deep tree changes
      characterData: false, // PERFORMANCE: Do not observe text changes directly
    });

    return () => {
      mutationObserver.disconnect();
      resizeObserver.disconnect();
    };
  }, []);

  function onViewportEnter() {
    setIsAtBottom(true);
    isAtBottomRef.current = true;
  }

  function onViewportLeave() {
    setIsAtBottom(false);
    isAtBottomRef.current = false;
  }

  return {
    containerRef,
    endRef,
    isAtBottom,
    scrollToBottom,
    onViewportEnter,
    onViewportLeave,
  };
}
