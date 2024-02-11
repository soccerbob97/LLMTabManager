<script>
    export let tab = [0, "", ""];

    function jump() {
        console.log('jumping to', tab[1]);
        window.parent.postMessage({type: 'jump', url: tab[1]}, '*'); // '*' means any origin
    }
</script>

<div class="small_square_tab_card">
    <a on:click={jump}>{tab[1]} - {tab[2]}</a>
</div>


<style>
    .small_square_tab_card {
        width: 100px;
        height: 100px;
        background-color: #f0f0f0;
        margin: 10px;
        padding: 10px;
        border-radius: 10px;
    }
    .small_square_tab_card a {
        text-decoration: none;
        color: black;
    }
    .small_square_tab_card a:hover {
        color: blue;
    }
</style>