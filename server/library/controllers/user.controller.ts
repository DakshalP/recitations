import { User } from '@dynrec/common';
import * as Boom from '@hapi/boom';
import { Controller, GetRequest, PostRequest, Unauthenticated } from '../decorators';
import { HttpArgs } from '../helpers/route.helper';
import { UserHelper } from '../helpers/user.helper';

@Controller
export class UserController {
    @GetRequest('/user')
    async getUsers(): Promise<User[]> {
        return User.find({});
    }

    @GetRequest('/user/me')
    async getCurrentUser({ currentUser }: HttpArgs<User>): Promise<User> {
        return currentUser;
    }

    @PostRequest('/user/signin')
    @Unauthenticated()
    async signin({ body }: HttpArgs<{ username: string; password: string }>): Promise<string> {
        const { username, password } = body;

        if (!password) throw Boom.badRequest('No password provided');

        const user = await User.findOne({
            where: { username },
            select: ['id', 'passwordHash', 'username'],
        });

        if (!user) throw Boom.notFound('User not found');

        if (!user.passwordHash) {
            throw Boom.badRequest('Password login disabled');
        }

        if (await UserHelper.comparePasswords(password, user.passwordHash)) {
            const jwt = UserHelper.generateJWT(user.id);
            return jwt;
        }

        throw Boom.unauthorized('Failed to sign in as user');
    }
}
