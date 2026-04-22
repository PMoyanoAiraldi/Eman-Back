import { SetMetadata } from "@nestjs/common";
import { rolEnum } from "src/users/users.entity";

export const Roles = (...roles: rolEnum[]) => SetMetadata('roles', roles);