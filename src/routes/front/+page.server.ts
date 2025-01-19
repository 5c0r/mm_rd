import { parseISO } from "date-fns";
import { isBefore } from 'date-fns/isBefore';
import { isAfter } from 'date-fns/isAfter';
import { getPostsInChannelWithPage, getThreadByPostId, getUserByIds, type MatterMostPostsResponse, type MatterMostUser, type Posts, type PostsWithScore } from "../../utils/api";
import { getScore } from "../../utils/score";
import { getTimeDifference } from "../../utils/time";
import asyncPool from "tiny-async-pool";

export const load = async ({ request }) => {

    const requestUrl = new URL(request.url);
    const sinceParams =requestUrl.searchParams.get('since');
    const since = sinceParams ? parseISO(sinceParams).getTime() : Date.now();

    // Since we listed basically all from the time here, we can also do client-side sorting
    const sortByTopRatedParams = requestUrl.searchParams.get('sortByTopRated');
    const sortByTopRated = sortByTopRatedParams ? sortByTopRatedParams === 'true' : false;

    // Loop until we get all the posts from the search result
    // While the final posts from the search result is from a earlier date than our query
    // Then we can stop querying the API
    let page = 0;
    let lastCreationDateFromQuery: Date | null = null;
    let postsResponse: Posts[] = [];

    console.log('since', since, sinceParams);

    // While the final posts from the search result is from a earlier date than our query
    // Then we can stop querying the API
    while(true) {
        const responseData = await getPostsInChannelWithPage(page);

        console.log('since2', since, sinceParams, page);

        console.log('responseData', responseData);
        const allPostsByOrder = responseData.order
            .map( (postId:any) => responseData.posts[postId])
            // Poor man's filter
            .filter((post:Posts) => isAfter(new Date(post.create_at), new Date(since)))
            // TODO: See if we can filter some type out (i.e: "system_add_to_channel", "system_join_channel", "system_****")
            // TODO: Clear all items that has "root_id", which is a comment

        postsResponse = [...postsResponse, ...allPostsByOrder];
        
        // Break when the next response is empty
        if(allPostsByOrder.length === 0) {
            break;
        }

        lastCreationDateFromQuery = allPostsByOrder[postsResponse.length - 1] ? new Date(allPostsByOrder[postsResponse.length - 1].create_at) : null;

        // Break when the next response is from a date earlier than our query
        if(lastCreationDateFromQuery && isBefore(lastCreationDateFromQuery, new Date(since))) {
            break;
        }
        page += 1;
        console.log('lastCreationDateFromQuery', lastCreationDateFromQuery);
        console.log('allPostsByOrder', allPostsByOrder.length);
    }
    const userIds = [...new Set(postsResponse.map((post:Posts) => post.user_id))]

    // TODO: There are some rate-limiting
    const allThreads = [...new Set(postsResponse.map((post:Posts) => post.id))];

    const users = await getUserByIds(userIds)

    // TODO: Again, reply_count is not populated when querying for posts
    const threadResponse = await asyncPool(50,allThreads,getThreadByPostId)
    
    const threadReplyCount: { id: string, reply_count: number }[] = [];
    for await (const thread of threadResponse) {
        threadReplyCount.push(...thread.order
            .map( (postId:any) => thread.posts[postId])
            .map((post:Posts) => ({ id: post.id, reply_count: post.reply_count })))
    } 
    const posts = postsResponse
        .filter((post:Posts) => 
            post.root_id === "" &&
            (post.type === "" || post.type.startsWith("system") === false) )
        .map((post:Posts) => {

            // To get reply_count
            const thread = threadReplyCount.find((x:any) => x.id === post.id);
            const author = users.find((user:MatterMostUser) => user.id === post.user_id);
            const embedWithUrl = post?.metadata?.embeds?.find((embed:any) => embed?.url);
            const since = getTimeDifference(post.create_at);
            const score = getScore(post, thread?.reply_count);

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
        // Poor man's sorting, if sortByTopRated is true, then sort by score, otherwise sort by create_at
        .sort((a:PostsWithScore, b:PostsWithScore) => sortByTopRated ? b.score - a.score : b.create_at - a.create_at)

        return {
            posts,
            users,
        }
}