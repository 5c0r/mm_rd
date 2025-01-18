import { CP_API_KEY } from '$env/static/private';

// User types
export type MatterMostUser = {
    id:                    string;
    create_at:             number;
    update_at:             number;
    delete_at:             number;
    username:              string;
    auth_data:             string;
    auth_service:          string;
    email:                 string;
    nickname:              string;
    first_name:            string;
    last_name:             string;
    position:              string;
    roles:                 string;
    props:                 Props;
    last_picture_update:   number;
    locale:                string;
    timezone:              Timezone;
    mfa_active:            boolean;
    disable_welcome_email: boolean;
}

export type Props = {
    customStatus: string;
}

export type Timezone = {
    automaticTimezone:    string;
    manualTimezone:       string;
    useAutomaticTimezone: string;
}



// Post types
export type Embed = {
    type: string;
    url:  string;
    data: Data;
}

export type Data = {
    type:              string;
    url:               string;
    title:             string;
    description:       string;
    determiner:        string;
    site_name:         string;
    locale:            string;
    locales_alternate: null;
    images:            Image[];
    audios:            null;
    videos:            null;
}

export type Image = {
    url:        string;
    secure_url: string;
    type:       string;
    width:      number;
    height:     number;
}

export type Reaction = {
    user_id:    string;
    post_id:    string;
    emoji_name: string;
    create_at:  number;
    update_at:  number;
    delete_at:  number;
    remote_id:  string;
    channel_id: string;
}

export type File = {
    id:                string;
    user_id:           string;
    post_id:           string;
    channel_id:        string;
    create_at:         number;
    update_at:         number;
    delete_at:         number;
    name:              string;
    extension:         string;
    size:              number;
    mime_type:         string;
    width:             number;
    height:            number;
    has_preview_image: boolean;
    mini_preview:      string;
    remote_id:         string;
    archived:          boolean;
}

export type PostsMetadata = {
    embeds?: Embed[];
    images?: Image[];
    reactions?: Reaction[];
    files?: File[];
}

export type Posts = {
    id:              string;
    create_at:       number;
    update_at:       number;
    edit_at:         number;
    delete_at:       number;
    is_pinned:       boolean;
    user_id:         string;
    channel_id:      string;
    root_id:         string;
    original_id:     string;
    message:         string;
    type:            string;
    props:           Record<string,string>;
    hashtags:        string;
    pending_post_id: string;
    has_reactions:   boolean;
    remote_id:       string;
    reply_count:     number;
    last_reply_at:   number;
    participants:    null;
    metadata?:        PostsMetadata;
}

export type MatterMostPostsResponse = {
    order:                        string[];
    posts:                        Record<string,Posts>;
    next_post_id:                 string;
    prev_post_id:                 string;
    first_inaccessible_post_time: number;
}

const getThreadByPostId = async (postId: string) => {
    const response = await fetch(`https://coderpull.com/api/v4/posts/${postId}/thread`, {
        headers: {
            Authorization: `Bearer ${apiKey}`
        }
    });

    return await response.json() as MatterMostPostsResponse;
}

const channelId = 'y6psyjn58idczfjgrd198b8byw';
const apiKey = CP_API_KEY;

const getUserByIds = async (userIds:any) => {
    const response = await fetch('https://coderpull.com/api/v4/users/ids', {
        method: 'post',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userIds)
    })

    return (await response.json()) as MatterMostUser[];
}

const getPostsInChannel = async (page: string) => {
    const response = await fetch(`https://coderpull.com/api/v4/channels/${channelId}/posts?page=${page}&per_page=50`, {
        headers: {
            Authorization: `Bearer ${apiKey}`
        }
    });
    return await response.json() as MatterMostPostsResponse;
}

export { getUserByIds, getPostsInChannel, getThreadByPostId };