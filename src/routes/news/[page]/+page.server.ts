
import type { PageServerLoad } from './$types';

import { getTimeDifference } from '../../../utils/time';
import { getPostsInChannel, getThreadByPostId, getUserByIds, type MatterMostPostsResponse, type MatterMostUser, type Posts } from '../../discussion/[post]/+page.server';


export const load: PageServerLoad = async ({ params }) => {
    const page = params.page;
    const responseData = await getPostsInChannel(page);

    console.log('posts response', responseData);
    const allPostsByOrder = responseData.order.map( (postId:any) => responseData.posts[postId]);
    const userIds = allPostsByOrder.map((post:Posts) => post.user_id)
    const allPostIds = allPostsByOrder.map((post:Posts) => post.id);

    const users = await getUserByIds(userIds)
    const threadResponse = await Promise.all(allPostIds.map(getThreadByPostId))
    const threadReplyCount = threadResponse
        .map((thread:MatterMostPostsResponse) => 
            thread.order
            .map( (postId:any) => thread.posts[postId])
            .map((post:Posts) => ({ id: post.id, reply_count: post.reply_count })))
        .flat()

    // TODO: This does not work, so we don't know if we have reached the final page
    // What we could do is maybe try to get the next page and see if we have some posts
    const hasNext = responseData.prev_post_id !== "";


    const posts = allPostsByOrder
        // TODO: See if we can filter some type out (i.e: "system_add_to_channel", "system_join_channel")
        // TODO: Clear all items that has "root_id"
        .filter((post:Posts) => 
            post.root_id === "" &&
            post.type !== "system_add_to_channel" && post.type !== "system_join_channel")
        .map((post:Posts) => {

            // To get reply_count
            const thread = threadReplyCount.find((x:any) => x.id === post.id);

            // Score
            const scoreMap: Record<string, number> = {
				"heart": 1,
				"thumbs_up": 1,
				"thumbs_down": -1,
				"laughing": 1,
				"dizzy": -2
			}
            
            const reactions = post.has_reactions === false ? [] : post.metadata?.reactions;

            // Score = reactions + reply_count
			const score = (post.has_reactions === false || !reactions) ? 0 : reactions
				.map( (reaction:any) => reaction.emoji_name)
				.map((emoji:any) => scoreMap[emoji] ?? 0)
				.reduce((a:number,b:number) => a+b, thread?.reply_count ?? 0);
            
            const author = users.find((user:MatterMostUser) => user.id === post.user_id);

            const embedWithUrl = post?.metadata?.embeds?.find((embed:any) => embed?.url);

            const since = getTimeDifference(post.create_at);

            // Edge case, sometime a post with pictures and then the main url is not embedded
            if(!embedWithUrl) {
                return {
                    ...post,
                    title: `CoderPull discussion: ${post.message.slice(0,20)}...`,
                    author,
                    score,
                    reply_count: thread?.reply_count ?? 0,
                    url: `https://coderpull.com/cdp/pl/${post.id}`,
                    since,
                    origin: undefined
                }
            }

			const url = embedWithUrl?.url ?? "";
			const title = embedWithUrl!.data?.title ?? url;
            const origin = new URL(url).hostname.replace("www.","");

            return {
                ...post,
                reply_count: thread?.reply_count ?? 0,
                score,
                author,
                url,
                title,
                since,
                origin
            }
        })

    return {
        // data: responseData,
        posts,
        users,
        hasNext
    }
};
