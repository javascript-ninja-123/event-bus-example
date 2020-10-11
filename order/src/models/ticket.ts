import mongoose, {Model, Document} from "mongoose"
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';


export interface ITicket {
    title: string;
    price: number;
    id: string;
}

export interface ITicketDocument extends Document {
    title: string;
    price:number;
    version:number;
}

export interface  ITicketSchema extends Model<ITicketDocument>{
    build(input: ITicket): ITicketDocument
}

const TicketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price:{
        type:Number,
        required:true
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
    return new Ticket({
        _id: input.id,
        title: input.title,
        price: input.price
    })
}

export const Ticket = mongoose.model<ITicketDocument, ITicketSchema>("Ticket", TicketSchema)