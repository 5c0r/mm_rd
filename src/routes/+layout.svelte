<script lang="ts">
	import Header from './Header.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<div class="app">
	<Header />

	<main>
		{@render children()}
	</main>

	<footer>
		<p>
			Welcome to <a href="https://coderpush.com">CoderShare</a> . A Product of <a href="https://coderpush.com">CoderPush</a>
		</p>
	</footer>
</div>

<svelte:head>
	<title>CoderShare</title>
</svelte:head>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		background-color: hsl(218, 33%, 15%);
		color: white;
		padding: 0.5rem;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
			p {
				margin: 0 0 0 0;
			}
		}
	}
</style>
