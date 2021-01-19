<script>
    import BlurhashImage from 'svelte-blurhash'
</script>

<style>
    .headshot {
        max-width: 600px;
        filter: grayscale(70%);
    }

    h3 {
        font-size: 2em;
        font-weight: 400;
        text-align: right;
    }
</style>

<h3>
    hi, i'm bryson
</h3>


<div style={"text-align: center"}>
    <img 
        class={"headshot"}
        style={"border-radius: 50%;"}
        src={"images/me_professional.jpg"} 
        alt={'a nice pic of me'} 
        width={"100%"}
    >
</div>
