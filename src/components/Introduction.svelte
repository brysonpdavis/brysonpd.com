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
    }
</style>

<div transition:blur={{duration: 700}} on:outroend={setActive}>
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
        i am a software developer based in <em>brooklyn, new york</em> with a primary background in videogame development, but i am no stranger to front- and back-end web and application development. 
        my <em>computer science</em> coursework at <em>wesleyan university</em> provided me with a strong theoretical background while i have learned how to quickly grasp and adapt new technologies in my various projects along the way. 
        i have been using <em>unity</em> for game and app development for three years now, while
        in the realm of web development, i work in the <em>node.js</em> ecosystem with <em>react</em> and, recently, <em>svelte</em> as my front-end tools of choice.
        technologies that excite me the most are those that intersect with and stimulate creativity in novel and inspiring ways,
        and i am always on the lookout for emerging new tools to accomplish new tasks.
    </p>

    <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
</div>