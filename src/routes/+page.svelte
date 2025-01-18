<script lang="ts">
	import type { PageData } from "./$types";

    const { data } = $props<{data: PageData}>();
</script>


<h4>Welcome to CoderNews</h4>
<p>To be able to comment in discussion. Please Login using your CoderPull Personal Access Token (Profile -> Security -> Personal Access Token)</p>
<p>If you are just browsing around, then let's go to the <a href="/news/0">News</a> page</p>

{#if data.loggedIn}
    <p>Your token is valid</p>
    <p>To logout, please remove the `mattermostKey` cookie from your browser. If you want to replace the existing token, you could also submit another one</p>
    <p></p>    
{/if}

{#if data.loggedIn === false}
    <p>Your token is invalid</p>
{/if}


<form method="POST">
    <input type="password" name="mattermostKey" placeholder="CoderPull Personal Access Token">
    <button type="submit">Login</button>
</form>