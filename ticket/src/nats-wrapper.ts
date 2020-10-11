import nats, {Stan} from "node-nats-streaming"

export class NatsWrapper {
    private static instance: NatsWrapper
    private static _client?: Stan

    private constructor(){}

    public connect(clusterId: string, clientId: string, url: string): Promise<void>{
        NatsWrapper._client = nats.connect(clusterId,clientId, {url})

        if(!NatsWrapper._client){
            throw new Error("failed to connect")
        }

        return new Promise((resolve,reject) => {
            NatsWrapper._client!.on("connect", () => {
                console.log("connected to NATS")
                resolve()
            })

            NatsWrapper._client!.on("error", (err) => {
                console.log("NATS error occured")
                reject(err)
            })
        })
    }

    public static getInstance(): NatsWrapper {
        if(!NatsWrapper.instance){
            NatsWrapper.instance = new NatsWrapper()
        }

        return NatsWrapper.instance
    }

    public get client(): Stan{
        if(!NatsWrapper._client) throw new Error("not nats")
        return NatsWrapper._client
    }
}

export const natsWrapper = NatsWrapper.getInstance()