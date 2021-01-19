<script>
  import VisibilityGuard from './VisibilityGuard.svelte';
  import Blurhash from './Blurhash.svelte';
  import { fade } from 'svelte/transition';

  export let src = '#';
  export let hash;
  export let width;
  export let height;
  export let alt = '';
  export let fadeDelay = 200;
  export let fadeDuration = 500;

  let isAbsolute = false;
  let isStatic = false;

  function setPosToAbsolute() {
    isAbsolute = true;
    isStatic = false;
  }
  function setPosToStatic() {
    isAbsolute = false;
    isStatic = true;
  }
</script>

<style>
  .isAbsolute {
    position: absolute;
    top: 0;
    left: 0;
  }
  .isStatic {
    position: static;
  }
</style>

<VisibilityGuard let:hasBeenVisible>
  {#if hasBeenVisible}
    <img
      in:fade={{ delay: fadeDelay, duration: fadeDuration }}
      class:isAbsolute
      class:isStatic
      {src}
      {alt}
      {width}
      {height} />
  {:else}
    <div
      out:fade={{ delay: fadeDelay, duration: fadeDuration }}
      on:outrostart={setPosToAbsolute}
      on:outroend={setPosToStatic}>
      <Blurhash {hash} {width} {height} />
    </div>
  {/if}
</VisibilityGuard>
