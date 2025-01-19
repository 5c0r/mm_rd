<script lang="ts">
	import type { PageData } from './$types';
	import { resolveRoute } from '$app/paths';
	import PostListItem from '../../components/PostListItem.svelte';


	const { data } = $props<{data: PageData}>();
	const posts = $state((data as PageData).posts);
	const prev_post_id = $state((data as PageData).prev_post_id);
	const next_post_id = $state((data as PageData).next_post_id);

</script>

<svelte:head>
	<title>MM-Reader</title>
</svelte:head>

<section>
	<ul>
		<!-- svelte-ignore a11y_missing_attribute -->
		{#if posts.length === 0}
			<h4>Nobody Here But Us Chickens! 🐔</h4>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<a target="_self" onclick={() => history.back()}>Back to the fun part!</a>  
		{:else}
			{#each posts as post}
				<PostListItem post={post} />
			{/each}
			<div class="pagination">
				{#if next_post_id !== ""}
					<a target="_self" href={`/news?after=${next_post_id}`}>Previous Page</a>
				{/if}
				{#if prev_post_id !== ""}
					<a target="_self" href={`/news?before=${prev_post_id}`}>Next Page</a>
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
	}
	.pagination {
		display: flex;
		justify-content: space-between;
		width: 100%;
		margin-top: 1em;
	}
</style>
