import {Subject, CreateTicketEvent, NatsPublisher} from "common-pubsub-listener"



export class CreateTicketPublisher extends NatsPublisher<CreateTicketEvent>{
    readonly subject: CreateTicketEvent["subject"] = Subject.TicketCreated
}