export default class WebWorkerWrapper {
    worker: Worker;
    initialized = false;

    constructor(filePath: string) {
        const workerUrl = new URL(filePath, window.location.origin);
        this.worker = new Worker(workerUrl, { type: "module" });
    }

    async initialize(): Promise<boolean> {
        this.worker.postMessage({
            type: "init",
        })

        const result = await this.waitForWorkerMessage(this.worker);

        if (result.type === "error")
            throw result.error;
        else if (result.type !== "init-done")
            throw new Error(`Webworker initialization failed: ${result}`)

        this.initialized = true;
        return true;
    }

    async runInference(input: any): Promise<any> {
        this.worker.postMessage({
            type: "run",
            input: input,
        })

        const result = await this.waitForWorkerMessage(this.worker);

        if (result.type === "error")
            throw result.error;
        else if (result.type !== "result")
            throw new Error(`Webworker inference failed: ${result}`)

        return result.results;
    }

    terminate() {
        this.worker.terminate();
    }

    async waitForWorkerMessage(worker: Worker): Promise<any> {
        return new Promise((resolve) => {
            function handler(event: MessageEvent<any>) {
                worker.removeEventListener("message", handler);
                resolve(event.data);
            }
            worker.addEventListener("message", handler);
        });
    }

}