import {NatsPublisher, Subject, UpdateTicketEvent} from "common-pubsub-listener"


export class UpdateTicketPublisher extends NatsPublisher <UpdateTicketEvent> {
    readonly subject: UpdateTicketEvent["subject"] = Subject.TicketUpdated
}