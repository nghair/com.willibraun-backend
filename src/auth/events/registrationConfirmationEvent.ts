export class RegistrationConfirmationEvent{
    constructor(
        public token: string,
        public email: string,
        public name: string
    ){}
}