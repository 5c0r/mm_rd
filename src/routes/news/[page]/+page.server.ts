
import type { PageServerLoad } from './$types';

import { getTimeDifference } from '../../../utils/time';
import { getPostsInChannel, type Posts, getUserByIds, getThreadByPostId, type MatterMostPostsResponse, type MatterMostUser } from '../../../utils/api';
import { getScore } from '../../../utils/score';


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

    const hasNext = responseData.prev_post_id !== "";


    const posts = allPostsByOrder
        // TODO: See if we can filter some type out (i.e: "system_add_to_channel", "system_join_channel", "system_****")
        // TODO: Clear all items that has "root_id", which is a comment
        .filter((post:Posts) => 
            post.root_id === "" &&
            post.type.includes("system") === false)
        .map((post:Posts) => {

            // To get reply_count
            const thread = threadReplyCount.find((x:any) => x.id === post.id);
            const author = users.find((user:MatterMostUser) => user.id === post.user_id);
            const embedWithUrl = post?.metadata?.embeds?.find((embed:any) => embed?.url);
            const since = getTimeDifference(post.create_at);
            const score = getScore(post);

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
        posts,
        users,
        hasNext
    }
};
