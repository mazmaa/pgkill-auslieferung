import { useEffect, useState } from "react";
import FileInfo from "./FileInfo";

export default function FilePicker({ file_, onFileChanged }) {
    const [file, setFile] = useState<null | File>(file_);

    async function pickFile() {
        const pickerOpts = {
            types: [
                {
                    description: "Audio Files",
                    accept: {
                        "audio/*": [".mp3"],
                    },
                },
            ],
            excludeAcceptAllOption: true,
            multiple: false,
        };

        const filehandle = (await window.showOpenFilePicker(pickerOpts))[0];
        const file = await filehandle.getFile();
        onFileChanged(file);
        setFile(file);
    }


    if (file === null || file === undefined) {

        return (
            <div className='flex items-center'>
                <button className='text-blue-600' onClick={pickFile}>Pick File</button>
            </div>
        );
    }

    return (
        <div className='flex items-center justify-between border border-gray-300 rounded px-3 py-2'>
            <FileInfo file_={file} />
            <div className='flex items-center'>
                <button className='text-blue-600' onClick={pickFile}>Change</button>
            </div>
        </div>
    );
}