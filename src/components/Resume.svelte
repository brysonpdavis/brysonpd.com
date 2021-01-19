<script>
    import {blur} from 'svelte/transition'
    export let setActive;
</script>

<style>
    h3 {
        font-size: 3rem;
        font-weight: 400;
        text-align: right;
        margin: 0;
        margin-bottom: 1em;
    }
    p {
        font-size: 2em;
    }
    .resume-container {
        width: 100%;
        text-align: center;
    }
    .resume-img {
        max-width: 100%;
        min-width: 400px;
        margin-left: auto;
        margin-right: auto;
    }
</style>

<div transition:blur on:outroend={setActive}>
    <h3>
        have a look at my resume
    </h3>

    <div class={"resume-container"}>
        <img class={"resume-img"} src={"images/resume.png"} alt={"my resume"}>
        <p>
            <a download="bryson-davis-resume.png" href="images/resume.png">
                download
            </a>
        </p>    
    </div>

</div>