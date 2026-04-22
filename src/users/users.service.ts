import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Users } from "./users.entity";
import { Repository } from "typeorm";

@Injectable()
export class UsersService {
    constructor(
    @InjectRepository(Users)
        private readonly usersRepository: Repository<Users>,
    ) { }

    async findAll(): Promise<Users[]> {
        return await this.usersRepository.find();
    }

    async getUserForId(id: string): Promise<Users | null>{
        return this.usersRepository.findOne({ where: {id}})
    }
}