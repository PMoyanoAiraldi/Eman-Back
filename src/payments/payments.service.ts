import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Payments } from "./payments.entity";
import { Repository } from "typeorm";

@Injectable()
export class PaymentsService {
    constructor(
    @InjectRepository(Payments)
        private readonly paymentsRepository: Repository<Payments>,
    ) { }
}