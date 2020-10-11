import express, { Request, Response, NextFunction } from "express"
import bodyParser from "body-parser"
import { body, validationResult } from 'express-validator';
import {natsWrapper} from "./nats-wrapper"
import {Order} from "./models/order"
import {Ticket} from "./models/ticket"
import {CreateOrderPublisher} from "./events/publishers/order-create-publisher"
import {CancelOrderPublisher} from "./events/publishers/order-cancelled-publisher"
import {OrderStatus} from "common-pubsub-listener"

const EXPIRATION_WINDOW_SECONDS = 1 * 60

//middleware
const validateMiddleware = (req: Request,res: Response,next: NextFunction) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).send({message: errors.array()})
    }
    next()
}


const app = express()
app.use(bodyParser.json())

app.post("/api/orders", [
    body("ticketId").notEmpty().withMessage("ticketId must be provided"),
], validateMiddleware, async (req: Request, res: Response) => {
    try{
        const {ticketId} = req.body

        const ticket = await Ticket.findById(ticketId)
        if(!ticket){
            throw new Error("ticket not found")
        }

        const expiration = new Date()
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)
        const order = Order.build({
            userId:"dasgasd",
            orderStatus:OrderStatus.OrderCreated,
            expiresAt:expiration,
            ticket:ticket
        })
        await order.save()
        //publish an event
        await new CreateOrderPublisher(natsWrapper.client).publish({
            orderId: order.id,
            ticketId: ticket.id,
            orderStatus: OrderStatus.OrderCreated,
            expiresAt: order.expiresAt.toISOString(),
            version: order.version
        })

        res.status(201).send(order)
    }
    catch(err){
        res.status(400).send({message: err.message})
    }
})

app.delete("/api/orders/:orderId", async (req: Request, res: Response) => {
    try{
        const {orderId} = req.params
        const order = await Order.findById(orderId).populate("ticket")
        if(!order){
            throw new Error("order not found")
        }
        order.orderStatus = OrderStatus.Cancelled
        await order.save()

        //publish an event
        await new CancelOrderPublisher(natsWrapper.client).publish({
            orderId: order.id,
            ticketId: order.ticket.id,
            orderStatus: OrderStatus.Cancelled,
            expiresAt: order.expiresAt.toISOString(),
            version: order.version
        })
        res.status(200).send({message:"cancelled"})
    }
    catch(err){
        res.status(400).send({message: err.message})
    }
})


export {app}