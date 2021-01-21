<script>
    import {blur} from 'svelte/transition'
    import Hide from './Hide.svelte';
    import ProjectInstance from './ProjectInstance.svelte';
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
        hyphens: auto;
        -webkit-hyphens: auto;
        -ms-hyphens: auto;
        margin-block-end: 0; 
    }

</style>

<div transition:blur={{duration: 700, amount: 20}} on:outroend={setActive}>
    <h3>
        a few of my fav projects
    </h3>
    <ProjectInstance
        name={'grainstems'}
        url={'https://www.grainstems.net'}
        imgSrc={'images/grainstems.png'}
        imgAlt={'grainstems interface'}
    >
        <p>
            started in late 2020 and still in develop&shy;ment, <a href="https://www.grainstems.net">grainstems</a> is a <em>gran&shy;ular synthe&shy;sizer and sample manipu&shy;lation webapp</em> created and developed solely by myself. 
            the app allows users to choose from a data&shy;base of samples which they can then repitch, filter, and adjust tempo/speed to create new, inter&shy;esting sounds,
            as well as the ability for users to upload their own samples for them&shy;selves and other users to granul&shy;arize.
        </p>
        <Hide>
            <p>
                the moti&shy;vation behind this app was to intro&shy;duce users to a new form of sound synthe&shy;sis with an attract&shy;ive and inform&shy;ative inter&shy;face 
                in an attempt to make the complex realm of gran&shy;ular synth&shy;esis more approach&shy;able while intro&shy;ducing a collabor&shy;ative element in the ability to share samples.
            </p>
            <p>
                the app makes exten&shy;sive use of <em>tone.js</em>, a node library that stream&shy;lines, abstr&shy;acts, and builds upon 
                feat&shy;ures of the native web audio api and provides the granu&shy;lar engine at the heart of grainstems. 
                hosted on <em>netlify</em> and built on a <em>jamstack architecture</em>, the project utilizes <em>react</em> for the front-end frame&shy;work, 
                in addi&shy;tion to <em>serverless functions</em>, an <em>aws s3</em> bucket, and a <em>graphql</em> inter&shy;face for query&shy;ing and mutat&shy;ing a <em>faunadb</em> data&shy;base.
                you can check out the work in prog&shy;ress at <a href="https://www.grainstems.net">grainstems.net</a>.
            </p>
        </Hide>
    </ProjectInstance>
    <ProjectInstance
        name={'crosshatch'}
        url={'http://www.crosshatch.space'}
        imgSrc={'images/crosshatch-header.png'}
        imgAlt={'crosshatch scene with logo'}
    >
        <p>
            my longest-running and most successful project thus far, <em>crosshatch</em> was an independent videogame project designed and developed by a group of four friends, including myself, from wesleyan. 
            the game was developed in <em>unity</em> and features a core mechanic of two <em>overlapping dimensions</em> that the player can travel and carry objects between to solve spatial and logical puzzles in a whimsical and colorful alien landscape. 
        </p>

        <Hide>    
            <p>
                we began part-time work on the game in the summer of 2018, developing mechanics and prototype levels until we brought a demo to <em>pax east</em> in march of 2019. soon after, the project was admitted into the 
                <em>nyu game center incubator</em> program, which we attended later that year from june to september, affording us the opportunity to work on the project full time with funding and guidance from nyu staff and industry figures.
                in our time at the incubator, we refined the ideas behind crosshatch and developed a <em>polished demo</em> while learning effective strategies for <em>project management</em> and <em>marketing</em>.
            </p>

            <p>
                as the <em>lead programmer</em> on the project, my responsibilities included implementing core game mechanics while maintaining good performance; debugging and optimizing the existing codebase; 
                setting up and maintaining a version control system with git; advising the rest of the team on the feasibility and scope of new mechanics or features;
                creating efficiency-minded developer tools for other team members; and developing an original promotional <a href={'http://www.crosshatch.space'}>website</a> for the game.
            </p>
            <p>
                as a core member of this small team, i learned as much about the dynamics of small team rapid development as i did the importance of a well-structured and optimized codebase.
            </p>
        </Hide>
    </ProjectInstance>

    <ProjectInstance
        name={'flux'}
        url={'https://youtu.be/24BwA6SMkLg'}
        imgSrc={'images/flux-team.jpg'}
        imgAlt={'the flux team'}
    >
        <p>
            <a href={'https://youtu.be/24BwA6SMkLg'}>flux</a> was a semester-long class project from my videogame development course at wesleyan university. 
            the game, a colorful puzzle-platformer developed in <em>unity</em> by a five-person dev team, where i fulfilled the role of lead programmer.
            it was targeted at 2nd through 5th grade students, with the goal of teaching young players the basic physics of magnetism.
        </p>
        <Hide>
            <p>
                to this end, we implemented instructive, <em>intuitive mechanics</em> rooted in real physics concepts but <em>simplified</em> for a young audience.
                an important aspect of the development of flux was our <em>iterative development cycle</em>. 
                to ensure that our mechanics were digestible, fun, and adequately instructive, 
                we brought prototypes to a nearby elementary school for target audience testing, and incorporated results into following iterations.
            </p>    
            <p>
                in the end, we were left with a game that the young students had a blast playing, and along the way, our team learned important lessons about developing with target audience, scope, and timeline in mind in addition to technical strategies for developing in unity.
                you can take a look at <a href={'https://youtu.be/24BwA6SMkLg'}>this video</a> i edited which includes gameplay footage, and comments from children who played the finished game.
            </p>
        </Hide>
    </ProjectInstance>
</div>