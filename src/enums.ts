export type AudioFormatEnum = typeof AudioFormats[keyof typeof AudioFormats]
export const AudioFormats = {
    MP3: "mp3",
    WAV: "wav",
    CHUNK: "chunk", // this will propably be split into several ones with different sample rates
} as const;

export type LlmOutputFormatEnum = typeof LlmOutputFormats[keyof typeof LlmOutputFormats]
export const LlmOutputFormats = {
    PLAIN_TEXT: "plain_text",
    JSON: "json"
} as const;

export type PipelineComponentStateEnum = typeof PipelineComponentStates[keyof typeof PipelineComponentStates]
export const PipelineComponentStates = {
    ERROR: "error",
    NOT_READY: "not_ready",
    PREPARING: "preparing",
    READY: "ready",
    RUNNING: "running",
} as const;