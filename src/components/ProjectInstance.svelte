<script>
    export let name
    export let url
    export let imgSrc
    export let imgAlt
</script>

<style>
    h4 {
        font-size: 2em;
        font-weight: 400;
        text-align: left;
        margin: 0;
    }

    .project-img-container {
        text-align: center;
        margin: 3em 0;
    }

    .project-img {
        width: 100%;
        filter: grayscale(70%);
        border-radius: 1em;
    }
    
    .project-container {
        margin: 2em 0;
    }

</style>

<div class={'project-container'}>
    <h4>
        <a href={url}>{name}</a>
    </h4>

    <div class={"project-img-container"}>
        <img class={"project-img"} src={imgSrc} alt={imgAlt}>
    </div>
    <slot>

    </slot>
</div>