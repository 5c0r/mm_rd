import { parseISO } from "date-fns";
import { getPostsInChannel, getThreadByPostId, getUserByIds, type MatterMostPostsResponse, type MatterMostUser, type Posts } from "../../utils/api";
import { getScore } from "../../utils/score";
import { getTimeDifference } from "../../utils/time";

export const load = async ({ request }) => {

    const sinceParams = new URL(request.url).searchParams.get('since')
    const since = sinceParams ? parseISO(sinceParams).getTime() : Date.now();

    const responseData = await getPostsInChannel(null, null);

    console.log('since', since, sinceParams);
    const allPostsByOrder = responseData.order
        .map( (postId:any) => responseData.posts[postId])
        // Poor man's filter
        .filter((post:Posts) => post.create_at > since);
    const userIds = [...new Set(allPostsByOrder.map((post:Posts) => post.user_id))]
    const allThreads = allPostsByOrder.map((post:Posts) => post.id);

    const users = await getUserByIds(userIds)
    const threadResponse = await Promise.all(allThreads.map(getThreadByPostId))
    
    const threadReplyCount = threadResponse
        .map((thread:MatterMostPostsResponse) => 
            thread.order
            .map( (postId:any) => thread.posts[postId])
            .map((post:Posts) => ({ id: post.id, reply_count: post.reply_count })))
        .flat()


    const posts = allPostsByOrder
        // TODO: See if we can filter some type out (i.e: "system_add_to_channel", "system_join_channel", "system_****")
        // TODO: Clear all items that has "root_id", which is a comment
        .filter((post:Posts) => 
            post.root_id === "" &&
            (post.type === "" || post.type.startsWith("system") === false) )
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
        }
}