import {app} from "./app"
import mongoose from "mongoose"
import {natsWrapper} from "./nats-wrapper"
import {CreateTicketListener} from "./events/listeners/ticket-create-listener"
import {UpdateTicketListener} from "./events/listeners/ticket-update-listener"
// your mongoDB URL
const URL = ""

const start = async () => {
    try{
        await mongoose.connect(URL, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})
        console.log("connected to mongodb")

        await natsWrapper.connect("ticketing", "west", "http://localhost:4222")

        natsWrapper.client.on("close", () => {
            console.log("NATS connection closed")
            process.exit()
        })

        process.on("SIGINT", () => {
            natsWrapper.client.close()
        })
        process.on("SIGTERM", () => natsWrapper.client.close())


        new CreateTicketListener(natsWrapper.client).listen()
        new UpdateTicketListener(natsWrapper.client).listen()

        app.listen(4000, () => console.log("listening to 5000"))
    }
    catch(err){
        console.log(err)
        process.exit()
    }
}


start()
