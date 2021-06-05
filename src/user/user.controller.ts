import { Controller, Get, Req, UnauthorizedException } from "@nestjs/common";
import { UserService } from "@user/user.service";
import { Request } from "express";

/**
 * Controller for handling user-related endpoints.
 */
@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get("profile")
    public async getProfile(@Req() req: Request) {
        const user = await this.userService.findOneById(req.user?.user?.id ?? "");
        if (!user) {
            throw new UnauthorizedException();
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...result } = user;
        return result;
    }
}
