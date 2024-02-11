<script>
    import { useChat } from 'ai/svelte';
    import Tab from "./Tab.svelte";
    import RefCard from "./RefCard.svelte";
    
    const { messages, append } = useChat();

    let query_prefix = "";
    let querying = true;

    let dummy_tab_data = [
        [1, "https://facebook.com", "Facebook"],
        [2, "https://instagram.com", "Instagram"]
    ]
    let tabs = [...dummy_tab_data];

    async function searchTabs() {
        if (query_prefix.length < 1) {
            return;
        }
        // querying = true;
        let data = await fetch(`http://127.0.0.1:8000/query_similar_tabs?k=5&query_prefix=${query_prefix}`);
        let json = await data.json();
        console.log(json);
        tabs = json;
    }

    async function ask_gpt() {
       querying = false;
       let query = `
        Answer my question based on context: ${query_prefix}.
        Use the provided excerpts to answer the question. Provide your answer as html.
        You must use the <a> tag, with the href attribute set to the URL of the source.
        Be very concise and provide links as often as possible.
        CONTEXT
        ${JSON.stringify(tabs)}
        ANSWER
        `;
       console.log('asking gpt'); 
       append({
           content: query,
           role: 'user'
       });
    }

    function handleMessageClick(event) {
        event.preventDefault();
        // if they clicked a link
        if (event.target.tagName === 'A') {
            // open the link in a new tab
            // window.open(event.target.href, '_blank');
            window.parent.postMessage({type: 'jump', url: event.target.href}, '*'); // '*' means any origin
        }
    }


</script>


<input type="text" placeholder="search your tabs..." bind:value={query_prefix} on:input={searchTabs} on:change={ask_gpt} />


{#if querying}
    {#each tabs as tab}
        <Tab bind:tab />
    {/each}
{/if}

{#if !querying}
    <div class="answer_and_ref_cards_container">
        <div class="answer_container">
            {#each $messages.slice().reverse().filter(m => m.role === 'assistant') as message}
                <div class="message" on:click={handleMessageClick}>
                    {@html message.content}
                </div>
            {/each}
        </div>
        <div class="ref_cards_right_sidebar" >
            {#each tabs as tab}
                <RefCard bind:tab />
            {/each}
        </div>
    </div>
{/if}

<style>
    .answer_and_ref_cards_container {
        display: flex;
        flex-direction: row;
    }
    .answer_container {
        flex: 1;
    }
    .ref_cards_right_sidebar {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    .message {
        padding: 10px;
        margin: 10px;
        border-radius: 10px;
        background-color: #f0f0f0;
    }
    .message a {
        color: red;
    }
</style>