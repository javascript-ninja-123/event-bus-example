import {Subject, NatsPublisher, CancelledOrder} from "common-pubsub-listener"


export class CancelOrderPublisher extends NatsPublisher <CancelledOrder>{
    readonly subject: CancelledOrder["subject"] = Subject.OrderCancelled
}