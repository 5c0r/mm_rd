export function handle({event, resolve}) {
    const mattermostKey = event.cookies.get('mattermostKey');

    // Typescript is not happy with this
    (event.locals as Record<string,string>)['mattermostKey'] = mattermostKey ?? "";

    return resolve(event);
}