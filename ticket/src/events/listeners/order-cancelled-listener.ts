import {Subject, BaseListener, CancelledOrder} from "common-pubsub-listener"
import { Message } from "node-nats-streaming"
import { Ticket } from "../../models/ticket"
import {QUEUE_NAME} from "./queue-name"
import {UpdateTicketPublisher} from "../ticket-update-publisher"

export class OrderCancelledListener extends BaseListener<CancelledOrder>{
    readonly subject: CancelledOrder["subject"] = Subject.OrderCancelled
    readonly queueName:string = QUEUE_NAME
    public async onMessage(data: CancelledOrder["data"], msg: Message){
        try{
            const {orderId, ticketId} = data
            const ticket = await Ticket.findById(ticketId)
            if(!ticket){
                throw new Error("not found")
            }
            ticket.orderId = undefined;
            await ticket.save()
            //publish 
            await new UpdateTicketPublisher(this.client).publish({
                ticketId: ticket!.id,
                version: ticket!.version,
                title: ticket!.title,
                price: ticket!.price,
                userId: "dasgdas",
                createdAt:  new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })

            msg.ack()
        }
        catch(err){
            throw err
        }
    }
}