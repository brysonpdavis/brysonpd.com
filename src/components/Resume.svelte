<script>

    import { resumeImg } from "../imageUrls";

</script>
<h3>have a look at my resume</h3>

<div class={"resume-container"}>
    <img class={"resume-img"} src={resumeImg} alt={"my resume"} />
    <p>
        download:
        <a download="bryson-davis-resume.png" href={resumeImg}> png </a>
        <a download="bryson-davis-resume.pdf" href="images/resume.pdf"> pdf </a>
    </p>
</div>

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
        margin-bottom: 0;
    }
    .resume-container {
        width: 100%;
        text-align: center;
    }
    .resume-img {
        width: 100%;
        max-width: 800px;
        /* min-width: 400px; */
        margin-left: auto;
        margin-right: auto;
        box-shadow: 0.25em 0.25em 0.5em #6300ee;
        border-radius: 0.5em;
    }
</style>
