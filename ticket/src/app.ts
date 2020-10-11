import express, { Request, Response, NextFunction } from "express"
import bodyParser from "body-parser"
import { body, validationResult } from 'express-validator';
import {Ticket} from "./models/ticket"
import {CreateTicketPublisher} from "./events/ticket-create-publisher"
import {UpdateTicketPublisher} from "./events/ticket-update-publisher"
import {natsWrapper} from "./nats-wrapper"
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

app.post("/api/tickets", [
    body("title").notEmpty().withMessage("title must be provided"),
    body("price").notEmpty().isFloat().withMessage("price must be number and must be provided")
], validateMiddleware, async (req: Request, res: Response) => {
    try{
        const {title, price} = req.body
        const ticket = Ticket.build({title,price})
        await ticket.save()

        //publish an event
        await new CreateTicketPublisher(natsWrapper.client).publish({
            ticketId: ticket!.id,
            title: ticket.title,
            price: ticket.price,
            userId: "dasgads",
            version: ticket.version,
            createdAt: new Date().toISOString()
        })

        res.status(201).send(ticket)
    }
    catch(err){
        res.status(400).send({message: err.message})
    }
})

app.put("/api/tickets/:ticketId", [body("title").notEmpty().withMessage("title must be provided"),
body("price").notEmpty().isFloat().withMessage("price must be number and must be provided")
], validateMiddleware, async (req: Request, res: Response) => {
    try{
        const {ticketId} = req.params
        const {title, price} = req.body
        const ticket = await Ticket.findById(ticketId)
        if(!ticket){
            throw new Error("ticket not found")
        }
        ticket.title = title
        ticket.price = price
        await ticket.save()

        await new UpdateTicketPublisher(natsWrapper.client).publish({
            ticketId: ticket.id,
            title: ticket.title,
            price: ticket.price,
            userId: "dasgads",
            version: ticket.version,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        })

        res.status(200).send(ticket)
    }
    catch(err){
        res.status(400).send({message: err.message})
    }
})


export {app}