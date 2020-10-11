import mongoose, {Model, Document} from "mongoose"
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import {ITicketDocument} from "./ticket"

export enum OrderStatus {
    OrderCreated = "order:created",
    PaymentWaiting = "payment:waiting",
    Cancelled = "order:cancelled",
    Complete = "order:complete"
}

export interface IOrder {
    userId: string;
    expiresAt: Date,
    orderStatus: OrderStatus
    ticket:ITicketDocument
}

export interface IOrderDocument extends Document {
    userId: string;
    expiresAt: Date,
    orderStatus: OrderStatus
    version: number;
    ticket:ITicketDocument
}

export interface  IOrderSchema extends Model<IOrderDocument>{
    build(input: IOrder): IOrderDocument
}

const OrderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    expiresAt: {
        type: mongoose.Schema.Types.Date
    },
    orderStatus:{
        type: String,
        required: true,
        enum:Object.values(OrderStatus),
        default: OrderStatus.OrderCreated
    },
    ticket:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Ticket"
    }
}, {
    toJSON:{
        transform(doc, ret){
            ret.id = ret._id
            delete ret._id
            delete ret.__v
            return ret
        }
    }
})


OrderSchema.set("versionKey", "version")
OrderSchema.plugin(updateIfCurrentPlugin)

OrderSchema.statics.build = function(input: IOrder){
    return new Order(input)
}

export const Order = mongoose.model<IOrderDocument, IOrderSchema>("Order", OrderSchema)