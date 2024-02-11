<script>
    export let tab = [0, "", ""];

    function jump() {
        console.log('jumping to', tab[1]);
        window.parent.postMessage({type: 'jump', url: tab[1]}, '*'); // '*' means any origin
    }
</script>

<div>
    <a on:click={jump}>{tab[1]} - {tab[2]}</a>
</div>