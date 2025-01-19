<script lang="ts">
	import { resolveRoute } from "$app/paths";
    import { page } from '$app/state';
	import type { PageData } from "./$types";
	import PostListItem from '../../components/PostListItem.svelte';
	import { format } from 'date-fns/format';
	import { addDays } from "date-fns"
    
	const sinceParams = page.url.searchParams.get('since');
	
	let dateValue = $derived(sinceParams ? new Date(sinceParams) : new Date());
    const { data } = $props<{data: PageData}>();
	let posts = $state((data as PageData).posts);

	function handleChange(event: any) {
		console.log('change', event);
		// goto doesnt work on SSR
		 window.location.href =`/front?since=${event.target.value}`
	}
</script>

<h4>Search post since a certain date</h4>
<input type="date" value={format(dateValue,'yyyy-MM-dd')} max={format(addDays(new Date(), 0),'yyyy-MM-dd')} name="since" onchange={handleChange} /> 

<section>
	<ul>
		{#if posts.length === 0}
			<h4>Nobody Here But Us Chickens! 🐔</h4>
		{:else}
			{#each posts as post}
				<PostListItem post={post} />
			{/each} 
		{/if}
	</ul>
</section>


<style>
	ul {
		list-style-type: none;
	}
</style>