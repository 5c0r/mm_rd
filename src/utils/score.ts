import type { Posts } from "./api";

export const getScore = (post: Posts) => {
    
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
        .reduce((a:number,b:number) => a+b, post.reply_count ?? 0);

    return score;
}