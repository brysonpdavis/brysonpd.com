<script>
    import {blur} from 'svelte/transition'
    export let setActive;
</script>

<style>
    h3 {
        font-size: 3em;
        font-weight: 400;
        text-align: right;
        margin: 0;
        margin-bottom: 1em;
    }

    h4 {
        font-size: 2em;
        font-weight: 400;
        text-align: left;
        margin: 0;
    }

    p {
        font-size: 2em;
    }

    .project-img-container {
        text-align: center;
        padding: 3em;
    }

    .project-img {
        width: 100%;
        filter: grayscale(70%);
    }
</style>

<div transition:blur on:outroend={setActive}>
    <h3>
        a few of my fav projects
    </h3>

    <h4>
        grainstems
    </h4>

    <div class={"project-img-container"}>
        <img class={"project-img"} src={"images/grainstems.png"} alt={"grainstems interface"}>
    </div>

    <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>

    <h4>
        crosshatch
    </h4>

    <div class={"project-img-container"}>
        <img class={"project-img"} src={"images/crosshatch-header.png"} alt={"grainstems scene with logo"}>
    </div>


    <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>

    <h4>
        flux
    </h4>

    <div class={"project-img-container"}>
        <img class={"project-img"} src={"images/flux-team.jpg"} alt={"the flux team"}>
    </div>


    <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
</div>