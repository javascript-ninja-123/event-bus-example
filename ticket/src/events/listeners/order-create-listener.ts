import {Subject, BaseListener, CreateOrderEvent} from "common-pubsub-listener"
import { Message } from "node-nats-streaming"
import { Ticket } from "../../models/ticket"
import {QUEUE_NAME} from "./queue-name"
import {UpdateTicketPublisher} from "../ticket-update-publisher"

export class OrderCreateListener extends BaseListener<CreateOrderEvent>{
    readonly subject: CreateOrderEvent["subject"] = Subject.OrderCreated
    readonly queueName:string = QUEUE_NAME
    public async onMessage(data: CreateOrderEvent["data"], msg: Message){
        try{
            const {orderId, ticketId} = data
            const ticket = await Ticket.findById(ticketId)
            if(!ticket){
                throw new Error("not found")
            }
            console.log(ticket.version)
            ticket.orderId = orderId;
            await ticket.save()
            console.log("after ticket saved", ticket.version)
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