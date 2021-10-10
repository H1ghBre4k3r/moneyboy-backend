import variables from "@config/variables";
import { IUser } from "@interfaces/user";
import { User } from "@models/user";
import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { v4 as uuid } from "uuid";

interface CreateUserData {
    username: string;
    displayName: string;
    password: string;
    email: string;
}

/**
 * Service for handling users of our application.
 * Inject it via `@Inject(UserServiceKey)`.
 *
 * @author Louis Meyer
 */
@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService,
    ) {}

    public async findAll(): Promise<IUser[]> {
        const users = await this.userRepository.find({
            where: {
                emailVerified: true,
            },
        });
        return users;
    }

    /**
     * Find a user by its username.
     */
    public async findByName(username: string): Promise<IUser | undefined> {
        return this.userRepository.findOne({
            where: {
                username,
            },
        });
    }

    /**
     * Find a user by its id.
     */
    public async findById(id: string): Promise<IUser | undefined> {
        return this.userRepository.findOne({
            where: {
                id,
            },
        });
    }

    /**
     * Tries to create a new user. If user already exists, updates it.
     */
    public async createUser(userData: CreateUserData): Promise<IUser> {
        try {
            return this.userRepository.save(
                User.fromData({
                    ...userData,
                    id: uuid(),
                    emailVerified: false,
                }),
            );
        } catch (e) {
            throw new InternalServerErrorException("Error during saving of user");
        }
    }

    public async updateUser(user: IUser): Promise<void> {
        await this.userRepository.update(
            {
                id: user.id,
            },
            user,
        );
    }

    public async deleteUser(id: string): Promise<void> {
        await this.userRepository.delete({
            id,
        });
    }

    /**
     * Change the verification status of a user to true.
     * @param token token with encoded user id
     */
    public async verifyUser(token: string): Promise<void> {
        let id = undefined;
        try {
            id = this.jwtService.verify(token, {
                secret: variables.token.verifyTokenSecret,
            });
        } catch {}
        const user = await this.findById(id);
        if (!user || user.emailVerified) {
            throw new BadRequestException();
        }
        user.emailVerified = true;
        await this.userRepository.save(user);
    }
}
