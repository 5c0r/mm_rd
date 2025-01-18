import { fail, redirect } from "@sveltejs/kit";

export const load = async ({ cookies }) => {
    const mattermostKey = cookies.get('mattermostKey');

    if(!mattermostKey) return {
        loggedIn: false
    }

    const responseToMM = await fetch('https://coderpull.com/api/v4/channels/y6psyjn58idczfjgrd198b8byw', {
        method: 'get',
        headers: {
            Authorization: `Bearer ${mattermostKey}`
        }
    })

    return {
        loggedIn: responseToMM.ok
    }
}

export const actions = {
    default: async({ cookies, request}) => {
        const data = await request.formData();

        const responseToMM = await fetch('https://coderpull.com/api/v4/channels/y6psyjn58idczfjgrd198b8byw', {
            method: 'get',
            headers: {
                Authorization: `Bearer ${data.get('mattermostKey')}`
            }
        })
        const isOK = responseToMM.ok;

        if(!isOK) {
            return fail(401, { message: 'Mattermost login failed' });
        }

        if(isOK) {
            const mattermostKey = data.get('mattermostKey')?.toString();
            cookies.set('mattermostKey', mattermostKey!, { path: '/', expires: new Date(Date.now() + 3600 * 1000) });
            return redirect(303, '/news/0');
        }
    }
}