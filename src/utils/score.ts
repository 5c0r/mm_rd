import type { Posts } from "./api";

// Score = reactions + reply_count
export const getScore = (post: Posts, replyCountFromThread: number | null = null) => {
    
    // Score mapping
    const scoreMap: Record<string, number> = {
        "heart": 1,
        "thumbs_up": 1,
        "thumbs_down": -1,
        "laughing": 1,
        "dizzy": -2
    }
    
    const reactions = post.has_reactions === false ? [] : post.metadata?.reactions;


    // reply_count is not populated correctly when querying for posts, we need to use "thread" to get the correct reply_count
    const score = (post.has_reactions === false || !reactions) ? 0 : reactions
        .map( (reaction:any) => reaction.emoji_name)
        .map((emoji:any) => scoreMap[emoji] ?? 1)
        .reduce((a:number,b:number) => a+b, replyCountFromThread ?? post.reply_count ?? 0);

    return score;
}