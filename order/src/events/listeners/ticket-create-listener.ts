import {BaseListener, Subject, CreateTicketEvent} from "common-pubsub-listener"
import { Message } from "node-nats-streaming"
import { Ticket } from "../../models/ticket"
import {QUEUE_NAME} from "./queue-name"

export class CreateTicketListener extends BaseListener <CreateTicketEvent> {
    readonly subject: CreateTicketEvent["subject"] = Subject.TicketCreated
    readonly queueName: string = QUEUE_NAME

    public async onMessage(data: CreateTicketEvent["data"], msg: Message){
        try{
            const {ticketId, title, price} = data
            const existingTicket = await Ticket.findById(ticketId)
            if(existingTicket){
                throw new Error("ticket already exists")
            }
            const ticket = Ticket.build({
                title:title,
                price: price,
                id: ticketId
            })
            await ticket.save()
            msg.ack()
        }
        catch(err){
            throw err
        }
    }
}