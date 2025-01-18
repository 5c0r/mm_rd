<script lang="ts">
	import { enhance } from '$app/forms';
    import type { PageData } from './$types';

	const pageData = $props<{data: PageData}>();
    const { author, title, score, since, mainTopic, comments, url, origin } = pageData.data as PageData;
</script>


<a class="title-link" href={url} target="_self">
    <h1>{title} </h1>
    <h3>({origin})</h3>
</a>
<p class="subtitle">{score} points by {author?.username} | {since}</p>

<p>{mainTopic?.message}</p>

<form method="POST">
    <input type="hidden" name="postId" value={mainTopic!.id}>
    <textarea name="comment" rows="5" cols="50" placeholder="Write your comment here..."></textarea>
    <br>
    <button type="submit">Comment</button>
</form>

<div class="comments">
    {#each comments as comment}
        <article class="comment">
            <p class="subtitle">{comment.author?.username} commented <span title="{new Date(comment.create_at).toLocaleString()}">{comment.since}</span></p>
            <p>{comment.isEmbeddedContent ? '<embedded content>' : comment.message}</p>
        </article>
    {/each}
</div>

<svelte:head>
    <title>{title}</title>
</svelte:head>


<style>
    a.title-link {
        text-decoration: none;
        color: inherit;
    }
    h1 {
        text-align: left;
    }
    .subtitle {
        font-size: 0.75em;
    }

    textarea {
        width: 100%;
        resize: both;
    }
</style>

