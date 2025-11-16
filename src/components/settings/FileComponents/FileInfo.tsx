import { useEffect, useState } from "react";

export default function FileInfo({ file_ }) {
    const [fileDuration, setFileDuration] = useState<null | number>(null);

    useEffect(() => {
        getAudioDuration(file_).then((duration) => {
            setFileDuration(duration);
        });
    }, [file_]);

    function formatSize(bytes: number | undefined): string {
        if (bytes === undefined) return "";
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function formatDuration(sec?: number | null): string {
        if (sec === undefined || sec === null) return "—";
        const total = Math.round(sec);
        const m = Math.floor(total / 60);
        const s = total % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    }

    function getAudioDuration(file: File): Promise<number> {
        return new Promise((resolve, reject) => {
            try {
                if (file === null)
                    return 0;

                const url = URL.createObjectURL(file);
                const audio = document.createElement('audio');
                audio.preload = 'metadata';
                audio.src = url;
                audio.onloadedmetadata = () => {
                    URL.revokeObjectURL(url);
                    resolve(audio.duration || 0);
                };
                audio.onerror = () => {
                    URL.revokeObjectURL(url);
                    reject(new Error('Failed to load audio metadata'));
                };
            } catch (err) {
                reject(err);
            }
        });
    }

    return (
        <>
            <div className='flex flex-col'>
                <span className='font-medium'>{file_.name}</span>
                <span className='text-sm text-gray-600'>Size: {formatSize(file_.size)} · Length: {formatDuration(fileDuration)}</span>
            </div>
        </>
    );
}