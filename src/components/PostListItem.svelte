<script lang="ts">
	import type { Posts } from "../utils/api";

    const { post } = $props<{post: Posts}>();
</script>


<li>
    <a href={post.url}>{post.title} <span class="origin">{post.origin ? `(${post.origin})` : ""}</span></a>
    <p class="subtitle">{post.score} points by {post.author?.username ?? 'Unknown user'} <span title={new Date(post.create_at).toString()}>{post.since}</span> | <a href="/discussion/{post.id}" target="_self">{post.reply_count} comments</a></p>
</li>

<style>
    span.origin {
        font-size: 12px;
        color: gray;
    }

    p.subtitle {
        font-size: 12px;
    }
</style>