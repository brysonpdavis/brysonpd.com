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
            my longest-running and most success&shy;ful project thus far, <em>crosshatch</em> was an indepen&shy;dent video&shy;game project designed and devel&shy;oped by a group of four friends, includ&shy;ing myself, from wesleyan. 
            the game was devel&shy;oped in <em>unity</em> and feat&shy;ures a core mechanic of two <em>over&shy;lapping dimen&shy;sions</em> that the player can travel and carry objects between to solve spatial and logical puzzles in a whim&shy;sical and color&shy;ful alien land&shy;scape. 
        </p>

        <Hide>    
            <p>
                we began part-time work on the game in the summer of 2018, devel&shy;oping mech&shy;anics and proto&shy;type levels until we brought a demo to <em>pax east</em> in march of 2019. soon after, the project was admitted into the 
                <em>nyu game center incu&shy;bator</em> program, which we attended later that year from june to sep&shy;tember, affording us the oppor&shy;tunity to work on the project full time with funding and guid&shy;ance from nyu staff and ind&shy;ustry figures.
                in our time at the incu&shy;bator, we refined the ideas behind cross&shy;hatch and devel&shy;oped a <em>polished demo</em> while learning effec&shy;tive strat&shy;egies for <em>project manage&shy;ment</em> and <em>market&shy;ing</em>.
            </p>

            <p>
                as the <em>lead pro&shy;grammer</em> on the project, my respons&shy;ibilities included imple&shy;menting core game mechanics while main&shy;taining good per&shy;formance; debugg&shy;ing and optimiz&shy;ing the existing codebase; 
                setting up and main&shy;taining a version control system with git; advising the rest of the team on the feas&shy;ibility and scope of new mechanics or fea&shy;tures;
                creating effic&shy;iency-minded devel&shy;oper tools for other team members; and devel&shy;oping an original promo&shy;tional <a href={'http://www.crosshatch.space'}>website</a> for the game.
            </p>
            <p>
                as a core member of this small team, i learned as much about the dynamics of small team rapid devel&shy;opment as i did the impor&shy;tance of a well-structured and optimized codebase.
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
            <a href={'https://youtu.be/24BwA6SMkLg'}>flux</a> was a semester-long class project from my video&shy;game devel&shy;opment course at wesleyan university. 
            the game, a color&shy;ful puzzle-plat&shy;former devel&shy;oped in <em>unity</em> by a five-person dev team, where i ful&shy;filled the role of lead pro&shy;grammer.
            it was tar&shy;geted at 2nd through 5th grade students, with the goal of teach&shy;ing young players the basic physics of magnetism.
        </p>
        <Hide>
            <p>
                to this end, we imple&shy;mented instr&shy;uctive, <em>intui&shy;tive mechanics</em> rooted in real physics concepts but <em>simpli&shy;fied</em> for a young audience.
                an important aspect of the devel&shy;opment of flux was our <em>itera&shy;tive devel&shy;opment cycle</em>. 
                to ensure that our mechanics were diges&shy;tible, fun, and adequa&shy;tely instruc&shy;tive, 
                we brought proto&shy;types to a nearby elemen&shy;tary school for target audience testing, and incorp&shy;orated results into follow&shy;ing iterations.
            </p>    
            <p>
                in the end, we were left with a game that the young students had a blast playing, and along the way, our team learned important lessons about developing with target audience, scope, and timeline in mind in addition to tech&shy;nical strat&shy;egies for devel&shy;oping in unity.
                you can take a look at <a href={'https://youtu.be/24BwA6SMkLg'}>this video</a> i edited which includes gameplay footage, and comments from children who played the finished game.
            </p>
        </Hide>
    </ProjectInstance>
</div>