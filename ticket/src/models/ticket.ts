import mongoose, {Model, Document} from "mongoose"
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export interface ITicket {
    title: string;
    price: number;
}

export interface ITicketDocument extends Document {
    title: string;
    price: number;
    version: number;
    orderId?: string;
}

export interface  ITicketSchema extends Model<ITicketDocument>{
    build(input: ITicket): ITicketDocument
}

const TicketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    orderId:{
        type: String
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


TicketSchema.set("versionKey", "version")
TicketSchema.plugin(updateIfCurrentPlugin)

TicketSchema.statics.build = function(input: ITicket){
    return new Ticket(input)
}

export const Ticket = mongoose.model<ITicketDocument, ITicketSchema>("Ticket", TicketSchema)