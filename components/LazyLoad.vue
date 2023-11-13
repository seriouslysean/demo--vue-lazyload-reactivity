<template>
  <div class="lazy-load">
    <slot :hasEnteredViewport="hasEnteredViewport" />
  </div>
</template>

<script>
// Client side singleton to cache IntersectionObserver instances. Based on Vue LazyHydrate
const observerCache = process.env.VUE_ENV === 'client' ? {} : null;
// Client side singleton to track how many elements are currently observed
const observerCounts = process.env.VUE_ENV === 'client' ? {} : null;
function defaultObserverCallback(entries) {
  entries.forEach((entry) => {
    // Pulled this rationale from LazyHydrate:
    //   Use `intersectionRatio` because of Edge 15's lack of support for `isIntersecting`
    //   See: https://github.com/w3c/IntersectionObserver/issues/211
    const isIntersecting = entry.isIntersecting || entry.intersectionRatio > 0;
    if (isIntersecting && entry.target.doActivate) {
      entry.target.doActivate();
    }
  });
}

export default {
  name: 'LazyLoad',
  props: {
    // Allow the calling context to pass in a cache key if it intends to use
    // an IntersectionObserver on many elements in the same page.  This allows
    // it to re-use the same IntersectionObserver instance for all observed
    // elements
    cacheKey: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      hasEnteredViewport: false,
      observer: false,
    };
  },
  mounted() {
    this.initObserver();
  },
  destroyed() {
    this.destroyObserver();
  },
  methods: {
    getObserver() {
      // Return from the cache if available
      if (this.cacheKey && observerCache[this.cacheKey]) {
        return observerCache[this.cacheKey];
      }
      console.log('Creating new IntersectionObserver');
      const observer = new IntersectionObserver(defaultObserverCallback, {
        root: null,
        rootMargin: `0px 0px 0px 0px`,
        threshold: 1.0,
      });
      if (this.cacheKey && !observerCache[this.cacheKey]) {
        console.log('Adding IntersectionObserver to cache:', this.cacheKey);
        observerCache[this.cacheKey] = observer;
      }
      return observer;
    },
    initObserver() {
      if (!window.IntersectionObserver) {
        console.log('IntersectionObserver not available.');
        this.hasEnteredViewport = true;
        this.$emit('enter-viewport');
        return;
      }

      this.observer = this.getObserver();
      // Expose a function on the DOM element for the IntersectionObserver callback
      // to call which provides access to the component instance and hasEnteredViewport.
      // Required for cached IntersectionObservers
      this.$el.doActivate = () => {
        console.log('Setting hasEnteredViewport=true');
        this.hasEnteredViewport = true;
        this.$emit('enter-viewport');
        // Once we're in the viewport, simply remain that way forever, so we can
        // destroy the observer
        this.destroyObserver();
        this.$el.doActivate = null;
      };
      this.observer.observe(this.$el);
      if (this.cacheKey) {
        observerCounts[this.cacheKey] =
          (observerCounts[this.cacheKey] || 0) + 1;
      }
    },
    destroyObserver() {
      if (!this.observer) {
        return;
      }
      console.log('Disconnecting IntersectionObserver');
      this.observer.unobserve(this.$el);
      if (this.cacheKey) {
        observerCounts[this.cacheKey]--;
      }
      this.observer.disconnect();
      if (this.cacheKey) {
        observerCache[this.cacheKey] = undefined;
        observerCounts[this.cacheKey] = undefined;
      }
      this.observer = null;
    },
  },
};
</script>
