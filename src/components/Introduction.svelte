<script>
    import { headshot } from "../imageUrls";
</script>

<h3>hi, i'm bryson</h3>

<div class={"headshot-container"}>
    <img
        class={"headshot"}
        style={"border-radius: 50%;"}
        src={headshot}
        alt={"a nice pic of me"}
        width={"100%"}
    />
</div>

<p>
    i’m a software engineer based in <em>brooklyn, new york</em> with a primary
    background in web and videogame development. my <em>computer science</em> coursework
    at <em>wesleyan university</em> provided me with a strong theoretical background
    while, in my professional experiences, i have come to understand that the
    most valuable skill one can have in our ever evolving landscape is the
    ability and drive to quickly and constantly learn. i have been primarily
    using <em>typescript</em> in the node ecosystem for three years now, doing plenty
    of professional frontend work in <em>react</em>, while choosing <em>svelte</em> for personal
    projects. i’m never happier than when focused on a project that has captured
    my attention.
</p>

<p>
    in my life outside of software development, i have held down a steady and
    rewarding part-time career as a bartender since 2018, and i find fulfillment
    in a number of creative pursuits. music production, photography, and graphic
    design are just a few of my many hobbies that keep me busy. both in my
    career and in my personal life, i most value creativity, clarity,
    dependability, and authenticity, and i hope with every decision i make to
    leave the world and the web a more beautiful place.
</p>

<style>
    .headshot {
        max-width: 600px;
        filter: grayscale(70%);
    }
    .headshot-container {
        text-align: center;
        margin: 3em 0;
    }

    h3 {
        font-size: 3em;
        font-weight: 400;
        text-align: right;
        margin: 0;
    }

    p {
        text-align: justify;
        hyphens: manual;
        -webkit-hyphens: manual;
        -ms-hyphens: manual;
    }

    @media screen and (min-width: 601px) {
        p {
            font-size: 2em;
        }
    }

    @media screen and (max-width: 600px) {
        p {
            font-size: 1.5em;
        }
    }
</style>
