import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "../entities/role.enum";

@Injectable()
export class RolesGuard implements CanActivate{
    constructor(
        private reflector: Reflector
    ){}

    canActivate(context: ExecutionContext): boolean{
        const permissibleRoles = this.reflector.getAllAndOverride<Array<Role[]>>('roles', [context.getHandler(), context.getClass()]);
        
        if (!permissibleRoles) {
			return true;
		}
        const { user } = context.switchToHttp().getRequest();
        return permissibleRoles.includes(user?.role);
    }
}