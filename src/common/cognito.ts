import {
    AuthenticationDetails,
    CognitoUser,
    CognitoUserPool,
    IAuthenticationDetailsData,
    ICognitoUserData,
    ICognitoUserPoolData,
} from 'amazon-cognito-identity-js';

const COGNITO_USER_POOL_ID = 'us-east-1_IzpTn4CAo';
const COGNITO_CLIENT_ID = '7vqqkbi0mgihvgn4cq60od92hn';

export enum CognitoStatus {
    Success,
    IncorrectUsernameOrPassword,
    NewUserError,
    ExistingUserError,
    UnknownError,
}

export type CognitoResult = {
    status: CognitoStatus;
    message?: string;
};

enum MessageStrings {
    Success = 'Success',
    UserNotFoundException = 'UserNotFoundException',
    NotAuthorizedException = 'NotAuthorizedException',
    AuthenticationFailed = 'Authentication failed',
    NewUserError = 'New user, password change required',
}

const createAuthenticationDetails = (
    username: string,
    password: string,
): AuthenticationDetails => {
    const authenticationData: IAuthenticationDetailsData = {
        Username: username,
        Password: password,
    };
    return new AuthenticationDetails(authenticationData);
};

const createCognitoUser = (username: string): CognitoUser => {
    const poolData: ICognitoUserPoolData = {
        UserPoolId: COGNITO_USER_POOL_ID,
        ClientId: COGNITO_CLIENT_ID,
    };
    const userPool = new CognitoUserPool(poolData);

    const userData: ICognitoUserData = {
        Username: username,
        Pool: userPool,
    };
    return new CognitoUser(userData);
};

const completeNewPasswordChallenge = (
    cognitoUser: CognitoUser,
    newPassword: string,
): Promise<CognitoResult> => {
    return new Promise((resolve) =>
        cognitoUser.completeNewPasswordChallenge(
            newPassword,
            {},
            {
                onSuccess: (result) =>
                    resolve({
                        status: CognitoStatus.Success,
                        message: result.getAccessToken().getJwtToken(),
                    }),

                onFailure: function (error) {
                    if (
                        error.name === MessageStrings.UserNotFoundException ||
                        error.name === MessageStrings.NotAuthorizedException
                    ) {
                        resolve({
                            status: CognitoStatus.IncorrectUsernameOrPassword,
                            message: MessageStrings.AuthenticationFailed,
                        });
                    } else {
                        resolve({
                            status: CognitoStatus.UnknownError,
                            message: error.name,
                        });
                    }
                },
            },
        ),
    );
};

const changePassword = (
    cognitoUser: CognitoUser,
    oldPassword: string,
    newPassword: string,
): Promise<CognitoResult> => {
    return new Promise((resolve) =>
        cognitoUser.changePassword(oldPassword, newPassword, (error) => {
            if (error) {
                resolve({
                    status: CognitoStatus.UnknownError,
                    message: error?.name,
                });
            } else {
                resolve({
                    status: CognitoStatus.Success,
                    message: MessageStrings.Success,
                });
            }
        }),
    );
};

export const cognitoLoginUser = async (
    username: string,
    password: string,
): Promise<CognitoResult> => {
    const cognitoUser = createCognitoUser(username);
    const authenticationDetails = createAuthenticationDetails(
        username,
        password,
    );

    return new Promise((resolve) =>
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: (result) =>
                resolve({
                    status: CognitoStatus.Success,
                    message: result.getAccessToken().getJwtToken(),
                }),

            onFailure: (error) => {
                if (
                    error.name === MessageStrings.UserNotFoundException ||
                    error.name === MessageStrings.NotAuthorizedException
                ) {
                    resolve({
                        status: CognitoStatus.IncorrectUsernameOrPassword,
                        message: MessageStrings.AuthenticationFailed,
                    });
                }
            },

            newPasswordRequired: () =>
                resolve({
                    status: CognitoStatus.NewUserError,
                    message: MessageStrings.NewUserError,
                }),
        }),
    );
};

export const cognitoLoginNewUser = async (
    username: string,
    temporaryPassword: string,
    newPassword: string,
): Promise<CognitoResult> => {
    const cognitoUser = createCognitoUser(username);
    const authenticationDetails = createAuthenticationDetails(
        username,
        temporaryPassword,
    );

    return new Promise((resolve) =>
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: () =>
                resolve({
                    status: CognitoStatus.ExistingUserError,
                    message: 'Existing user, password change not handled',
                }),

            onFailure: (error) => {
                if (
                    error.name === MessageStrings.UserNotFoundException ||
                    error.name === MessageStrings.NotAuthorizedException
                ) {
                    resolve({
                        status: CognitoStatus.IncorrectUsernameOrPassword,
                        message: MessageStrings.AuthenticationFailed,
                    });
                }
            },

            newPasswordRequired: async () =>
                resolve(
                    await completeNewPasswordChallenge(
                        cognitoUser,
                        newPassword,
                    ),
                ),
        }),
    );
};

export const cognitoChangePassword = async (
    username: string,
    oldPassword: string,
    newPassword: string,
): Promise<CognitoResult> => {
    const cognitoUser = createCognitoUser(username);
    const authenticationDetails = createAuthenticationDetails(
        username,
        oldPassword,
    );

    return new Promise((resolve) =>
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: async () =>
                resolve(
                    await changePassword(cognitoUser, oldPassword, newPassword),
                ),

            onFailure: (error) => {
                if (
                    error.name === MessageStrings.UserNotFoundException ||
                    error.name === MessageStrings.NotAuthorizedException
                ) {
                    resolve({
                        status: CognitoStatus.IncorrectUsernameOrPassword,
                        message: MessageStrings.AuthenticationFailed,
                    });
                }
            },

            newPasswordRequired: () =>
                resolve({
                    status: CognitoStatus.NewUserError,
                    message: MessageStrings.NewUserError,
                }),
        }),
    );
};
