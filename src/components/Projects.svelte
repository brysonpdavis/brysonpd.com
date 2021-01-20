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
        text-align: justify;
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

<div transition:blur={{duration: 700, amount: 20}} on:outroend={setActive}>
    <h3>
        a few of my fav projects
    </h3>

    <h4>
        <a href="https://www.grainstems.net">grainstems</a>
    </h4>

    <div class={"project-img-container"}>
        <img class={"project-img"} src={"images/grainstems.png"} alt={"grainstems interface"}>
    </div>

    <p>
        started in late 2020 and still in development, <a href="https://www.grainstems.net">grainstems</a> is a <em>granular synthesizer and sample manipulation webapp</em> created and developed solely by myself. 
        the app allows users to choose from a database of samples which they can then repitch, filter, and adjust tempo/speed to create new, interesting sounds.
        my favorite feature is the ability for users to upload their own samples for themselves and other users to granularize.
        the motivation behind this app was to introduce users to a new form of sound synthesis with an attractive and informative interface 
        in an attempt to make the complex realm of granular synthesis more approachable while introducing a collaborative element in the ability to share samples.
    </p>
    <p>
        the app makes extensive use of <em>tone.js</em>, a node library that streamlines, abstracts, and builds upon 
        features of the native web audio api and provides the granular engine at the heart of grainstems. 
        hosted on <em>netlify</em> and built on a <em>jamstack architecture</em>, the project utilizes <em>react</em> for the front-end framework, 
        in addition to <em>serverless functions</em>, an <em>aws s3</em> bucket, and a <em>graphql</em> interface for querying and mutating a <em>faunadb</em> database.
        you can check out the in-development app at <a href="https://www.grainstems.net">grainstems.net</a>.
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