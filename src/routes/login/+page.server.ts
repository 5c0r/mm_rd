import { fail, redirect } from '@sveltejs/kit';


export const load = async ({ locals }) => {
    const mattermostKey = locals as Record<string,string>['mattermostKey'];
    if(mattermostKey) {
        return redirect(307,'/news');
    }
    return redirect(307, '/login');
}

export const actions = {
    default: async({ cookies, request}) => {
        const data = await request.formData();

        const responseToMM = await fetch('https://coderpull.com/api/v4/channels/y6psyjn58idczfjgrd198b8byw')
        const isOK = responseToMM.ok;

        if(!isOK) {
            return fail(401, { message: 'Mattermost login failed' });
        }

        if(isOK) {
            const mattermostKey = data.get('mattermostKey')?.toString();
            cookies.set('mattermostKey', mattermostKey!, { path: '/' });
            return redirect(307, '/news');
        }
    }
}
