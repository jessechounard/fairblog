import { handlerPath } from 'src/common/handler-resolver';

export default {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            http: {
                method: 'post',
                path: '/user/changePassword',
            },
        },
    ],
};
