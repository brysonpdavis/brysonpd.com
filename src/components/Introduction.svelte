<script>
    import {blur} from 'svelte/transition'
    export let setActive;
</script>

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
        font-size: 2em;
        text-align: justify;
        hyphens: auto;
        -webkit-hyphens: auto;
        -ms-hyphens: auto;
    }
</style>

<div transition:blur={{duration: 700, amount: 20}} on:outroend={setActive}>
    <h3>
    hi, i'm bryson
    </h3>

    <div class={"headshot-container"}>
        <img 
            class={"headshot"}
            style={"border-radius: 50%;"}
            src={"images/me_professional.jpg"} 
            alt={'a nice pic of me'} 
            width={"100%"}
        >
    </div>

    <p>
        i am a soft&shy;ware deve&shy;loper based in <em>brooklyn, new york</em> with a primary back&shy;ground in video&shy;game develop&shy;ment, but i am no stranger to front- and back-end web and applica&shy;tion develop&shy;ment. 
        my <em>computer science</em> course&shy;work at <em>wesleyan university</em> provided me with a strong theore&shy;tical back&shy;ground while i have learned how to quickly grasp and adapt new techno&shy;logies in my various projects along the way. 
        i have been using <em>unity</em> for game and app develop&shy;ment for three years now, while
        in the realm of web develop&shy;ment, i work in the <em>node.js</em> eco&shy;system with <em>react</em> and, recently, <em>svelte</em> as my front-end tools of choice.
        techno&shy;logies that excite me the most are those that inter&shy;sect with and stimulate crea&shy;tivity in novel and inspi&shy;ring ways,
        and i am always on the look&shy;out for emerging tools to accom&shy;plish new tasks.
    </p>

    <p>
        in my life outside of software development, i find fulfillment in many creative pursuits. music production, photography, graphic design are just a few of my many hobbies that keep me busy. 
        both in my career and in my life, i most value creativity, clarity, dependability, and authenticity, and i hope with every decision i make to leave the world and the web a more beautiful place.
    </p>
</div>