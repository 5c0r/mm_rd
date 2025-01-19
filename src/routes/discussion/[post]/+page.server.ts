import { getThreadByPostId, getUserByIds, type MatterMostPostsResponse, type Posts } from "../../../utils/api";
import { getScore } from "../../../utils/score";
import { getTimeDifference } from "../../../utils/time";
import { redirect } from "@sveltejs/kit";


export const load = async ({ params }) => {
	const { post: postId } = params;
	const res = await getThreadByPostId(postId);

    // TODO: Not found , 401 , 403


    // TODO: First post as the message discussion and title
    // Rest are returned as comments

    const discussions = res.order.map( (postId: string) => res.posts[postId]);

    const mainTopic = discussions.find((discussion:Posts) => discussion.root_id === "");
    const allUserIds = discussions.map((d:Posts) => d.user_id);
    const allUserInDiscussion = await getUserByIds(allUserIds);


    const threadResponse = [await getThreadByPostId(mainTopic!.id)]; 
    const threadReplyCount = threadResponse
        .map((thread:MatterMostPostsResponse) => 
            thread.order
            .map( (postId:string) => thread.posts[postId])
            .map((post:Posts) => ({ id: post.id, reply_count: post.reply_count })))
        .flat()

    // TODO: Since Timestamp could be moved as "client-side thing" instead
    const since = getTimeDifference(mainTopic?.create_at ?? Date.now());
    // Score
    const score = getScore(mainTopic! , threadReplyCount.find((x:any) => x.id === mainTopic?.id)?.reply_count ?? 0);

    const author = allUserInDiscussion.find((user:any) => user.id === mainTopic?.user_id);
    const comments = discussions
        .filter((discussion:Posts) => discussion.root_id === mainTopic?.id)
        .map((discussion:Posts) => {
            const commentAuthor = allUserInDiscussion.find((user:any) => user.id === discussion.user_id);
            const since = getTimeDifference(discussion.create_at);

            const isEmbeddedContent = discussion.metadata?.files?.length ?? 0 > 0;
            return {
                ...discussion,
                author: commentAuthor,
                isEmbeddedContent,
                since
            }
        })

    const embedWithUrl = mainTopic!.metadata?.embeds?.find((embed:any) => embed?.url);

    if(!embedWithUrl) {
        return {
            mainTopic, 
            url: `https://coderpull.com/cdp/pl/${mainTopic!.id}`,
            title: `CoderPull discussion: ${mainTopic!.message.slice(0,20)}...`,
            origin: "coderpull.com", 
            author, since, score, comments
        }
    }

    const url = embedWithUrl?.url ?? "";
    const title = embedWithUrl!.data?.title ?? url;
    const origin = new URL(url).hostname.replace("www.","");

    return {
        mainTopic, url, title, origin, author, since, score, comments
    };

};

export const actions = {
    default: async ({ request, cookies }) => {
        
        const mattermostKey = cookies.get("mattermostKey");
        const formData = await request.formData();
        const currentPath = request.url;

        const mmResponse = await fetch('https://coderpull.com/api/v4/posts', {
            method: 'post',
            headers: {
                // TODO: Change to user key instead
                Authorization: `Bearer ${mattermostKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: formData.get('comment'),
                channel_id: 'y6psyjn58idczfjgrd198b8byw',
                root_id: formData.get('postId')
            })
        })

        console.log('mmResponse', mmResponse);
        if(mmResponse.ok) {
            console.log('success', currentPath);
            redirect(303, currentPath);
        }

        if(mmResponse.status === 401 || mmResponse.status === 403) {
            return redirect(307, '/');
        }

        return redirect(303, '/news');
    }
}