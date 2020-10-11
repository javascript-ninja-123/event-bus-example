import {Subject, NatsPublisher, CreateOrderEvent} from "common-pubsub-listener"


export class CreateOrderPublisher extends NatsPublisher < CreateOrderEvent> {
    readonly subject: CreateOrderEvent["subject"] = Subject.OrderCreated
}