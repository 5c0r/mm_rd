<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/state';
	import { resolveRoute } from '$app/paths';

	console.log('current page', page.params.page);

	const { data } = $props<{data: PageData}>();
	let posts = $state((data as PageData).posts);
	let pageNumber = parseInt(page.params.page);
	let hasNext = $state((data as PageData).hasNext);

</script>

<svelte:head>
	<title>MM-Reader</title>
</svelte:head>

<section>
	<ul>
		{#if posts.length === 0}
			<h4>Nobody Here But Us Chickens! 🐔</h4>
			<a target="_self" href={resolveRoute(`/news/[page]`, { page: (pageNumber - 1).toString()})}>Back to the fun part!</a>  
		{:else}
			{#each posts as post}
				<li>
					<a href={post.url}>{post.title} <span class="origin">{post.origin ? `(${post.origin})` : ""}</span></a>
					<p class="subtitle">{post.score} points by {post.author?.username ?? 'Unknown user'} {post.since} | <a href="/discussion/{post.id}" target="_self">{post.reply_count} comments</a></p>
				</li>
			{/each}
			<div class="pagination">
				{#if pageNumber >= 1}
					<a target="_self" href={resolveRoute(`/news/[page]`, { page: (pageNumber - 1).toString()})}>Previous Page</a>
				{/if}
				{#if hasNext}
					<a target="_self" href={resolveRoute(`/news/[page]`, { page: (pageNumber + 1).toString()})}>Next Page</a>
				{/if}
			</div>
		{/if}
	</ul>
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}

	ul {
		list-style-type: none;

		span.origin {
			font-size: 12px;
			color: gray;
		}

		p.subtitle {
			font-size: 12px;
		}
	}
	.pagination {
		display: flex;
		justify-content: space-between;
		width: 100%;
		margin-top: 1em;
	}
</style>
