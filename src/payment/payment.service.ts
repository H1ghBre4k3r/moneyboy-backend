import { PaymentDTO } from "@interfaces/payment";
import { IUser } from "@interfaces/user";
import { Payment } from "@models/payment";
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserService } from "@user/user.service";
import { Repository } from "typeorm";
import { v4 as uuid } from "uuid";

@Injectable()
export class PaymentService {
    constructor(
        private readonly userService: UserService,
        @InjectRepository(Payment) private readonly paymentRepository: Repository<Payment>,
    ) {}

    public async create(from: IUser, { to, date, amount }: PaymentDTO) {
        const target = await this.userService.findById(to);
        if (!target) {
            throw new BadRequestException("Target user does not exist.");
        }

        const payment = new Payment();
        payment.id = uuid();
        payment.from = from;
        payment.to = target;
        payment.date = date;
        payment.amount = amount;

        await this.paymentRepository.save(payment);
    }

    public async findAll() {
        return this.paymentRepository.find();
    }

    public async findOne(user: IUser, id: string) {
        const payment = await this.paymentRepository.findOne({
            where: {
                id: id,
            },
            relations: ["to", "from"],
        });

        if (!payment || (payment.from.id !== user.id && payment.to.id !== user.id)) {
            throw new UnauthorizedException();
        }

        return payment;
    }

    public async update(_payment: PaymentDTO) {
        throw new Error("Not implemented");
    }

    public async remove(_id: string) {
        throw new Error("Not implemented");
    }
}