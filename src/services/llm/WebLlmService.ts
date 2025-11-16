import { LlmOutputFormats } from "../../enums";
import LlmServiceBase, { type LlmService } from "./LlmServiceBase";
import { CreateMLCEngine, MLCEngine, type InitProgressReport } from "@mlc-ai/web-llm";
import { notificationService } from "../NotificationService";


class WebLlmService extends LlmServiceBase implements LlmService {
    name = "WebLLM";
    outputFormat = LlmOutputFormats.PLAIN_TEXT;

    private engine: MLCEngine | null = null;
    private lastNotificationTime: number | null = null;

    async prepareService() {
        try {
            // This line uses the short name, which defaults to the mlc-ai repo
            this.engine = await CreateMLCEngine("Phi-3-mini-4k-instruct-q4f32_1-MLC", {
                initProgressCallback: p => this.progressCallback(p)
            });
            notificationService.showSuccessNotification("WebLLM model loaded successfully!");
            return true;

        } catch (error) {
            notificationService.showErrorNotification("Failed to load WebLLM model");
            throw error;
        }
    }

    async processTranscription(transcription: string): Promise<string> {
        const messages = [
            { role: "system" as const, content: "You are a specialist in construction inspections." },
            { role: "user" as const, content: `Create a construction inspection report for the following:\n ${transcription}` }
        ];

        const chunks = await this.engine!.chat.completions.create({
            messages,
            temperature: 1,
            stream: true, // <-- Enable streaming
            stream_options: { include_usage: true },
        });

        let reply = "";
        for await (const chunk of chunks) {
            reply += chunk.choices[0]?.delta.content || "";
            console.log(reply);
            if (chunk.usage) {
                console.log(chunk.usage); // only last chunk has usage
            }
        }

        const fullReply = await this.engine!.getMessage();

        return fullReply;
    }

    progressCallback(progress: InitProgressReport): void {
        const currentTime = Date.now();

        if (this.lastNotificationTime === null || (currentTime - this.lastNotificationTime) > 2000) {
            notificationService.showProgressNotification(
                progress.text || "Loading WebLLM model...",
                progress.progress
            );
            this.lastNotificationTime = Date.now();
        }

    }
}

export default WebLlmService;