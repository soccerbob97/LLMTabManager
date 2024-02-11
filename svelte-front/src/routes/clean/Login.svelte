<script>
    export let data;
</script>

<div class="login_container">
    <form method="POST">
        <label>
            What is your username?:
            <input
                name="user"
                autocomplete="off"
                required
            />
        </label>
    </form>
</div>

<style>
    .login_container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        margin: 20px;
    }
</style>
