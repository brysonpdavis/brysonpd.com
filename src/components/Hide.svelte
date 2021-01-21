<script>
    import {slide} from 'svelte/transition'
    let hidden = true;
</script>
<style>
    button {
        font-family: arrows;
        border-radius: 0%;
        font-size: 1.5em;
        box-shadow: 4px 4px 3px #6300ee;
    }

    .button-container {
        margin-top: 2em;
        text-align: center;
        width: 100%;
    }

    .slide {
        padding: 0.1px
    }
    .rotate {
        transform: rotate(180deg);

    }
    .t {
        transition-property: transform;
        transition-duration: 400ms;
    }
</style>
{#if !hidden}
    <div class={"slide"} transition:slide>
        <slot>

        </slot>
    </div>
{/if}
<div class="button-container">
    <button on:click={() => hidden = !hidden}><div class={'t'} class:rotate={hidden}>&#x2191</div></button>
</div>


