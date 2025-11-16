import { useState, useEffect } from "react";
import InputMicrophoneService from "../../services/input/InputMicrophoneService";

interface MicrophoneControlProps {
    microphoneService: InputMicrophoneService;
}

function MicrophoneControl({ microphoneService }: MicrophoneControlProps) {
    const [isRecording, setIsRecording] = useState(microphoneService.isRecording.value);
    const [recordingTime, setRecordingTime] = useState(0);

    useEffect(() => {
        const subscription = microphoneService.isRecording.subscribe(setIsRecording);

        return () => {
            subscription.unsubscribe();
        };
    }, [microphoneService]);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isRecording) {
            interval = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            setRecordingTime(0);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isRecording]);

    const handleStopRecording = () => {
        microphoneService.stopRecording();
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };


    return (
        <div>
            {
                isRecording && (
                    < button className="flex items-center gap-2"
                        onClick={handleStopRecording} >
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="font-mono">
                            {formatTime(recordingTime)}
                        </span>
                    </button >)
            }
        </div>
    )
}

export default MicrophoneControl;