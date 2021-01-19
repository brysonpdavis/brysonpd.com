<style>
    .content {
        background-color: #000000aa;
        padding: 3em;
    }

    .container {
        width: 100%;
        min-height: calc(100vh - 9em);
        max-width: 1000px;
        margin-left: auto;
        margin-right: auto;
    }
</style>

<div class="content">
    <div class="container">
        <slot></slot>
    </div>
</div>