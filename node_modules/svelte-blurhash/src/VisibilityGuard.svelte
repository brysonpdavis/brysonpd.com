<script>
  // https://hat-tap.com/blog/posts/images-in-svelte-lazy-loading-with-placeholder/

  import { onMount } from 'svelte';

  let el = null;
  let visible = false;
  let hasBeenVisible = false;
  let observer = null;
  let rootMargin = '0px 0px 200px 0px';

  onMount(() => {
    observer = new IntersectionObserver(
      entries => {
        visible = entries[0].isIntersecting;
        hasBeenVisible = hasBeenVisible || visible;
      },
      { rootMargin: rootMargin }
    );
    observer.observe(el);

    return () => {
      if (!hasBeenVisible) {
        observer.unobserve(el);
      }
    };
  });

  $: if (hasBeenVisible) {
    observer.unobserve(el);
  }
</script>

<div bind:this={el} style="position: relative;">
  <slot {visible} {hasBeenVisible} />
</div>
