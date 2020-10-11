import {BaseListener, Subject, UpdateTicketEvent} from "common-pubsub-listener"
import { Message } from "node-nats-streaming"
import { Ticket } from "../../models/ticket"
import { QUEUE_NAME } from "./queue-name"


export class UpdateTicketListener extends BaseListener<UpdateTicketEvent>{
    readonly subject: UpdateTicketEvent["subject"] = Subject.TicketUpdated
    readonly queueName: string = QUEUE_NAME
    public async onMessage(data: UpdateTicketEvent["data"], msg: Message){
        try{
            const {ticketId} = data
            const ticket = await Ticket.findById(ticketId)
            if(!ticket){
                throw new Error("ticket not found")
            }
            ticket.title = data.title
            ticket.price = data.price
            await ticket.save()
            msg.ack()
        }
        catch(err){
            throw err
        }
    }
}