import { useState, useEffect } from "react";
import { ServiceManager } from "../../services/ServiceManager";
import { InputResult } from "../../services/input/InputServiceBase";
import FileInfo from "../settings/FileComponents/FileInfo";

function InputOutputs() {
    const [inputResults, setInputResults] = useState<InputResult[]>([]);

    // react to output changes
    useEffect(() => {
        const sub = ServiceManager.instance.inputOutputs.subscribe(outputs => setInputResults(outputs));
        return () => sub.unsubscribe();
    })

    function renderResult(result: InputResult): JSX.Element {
        if (result.data instanceof File)
            return (<>
                <div className='flex items-center justify-between border border-gray-300 rounded px-3 py-2'>
                    <FileInfo file_={result.data} />
                    <div className='flex items-center'>
                        <audio controls src={URL.createObjectURL(result.data)} />
                    </div>
                </div>
            </>)

        return (<>
            {JSON.stringify(result)}
        </>);
    }

    return (
        <>
            <div className='flex flex-col  gap-2'>
                {inputResults.map(result => <li key={result.timestamp}>{renderResult(result)}</li>).reverse()}
            </div>
        </>
    );
}

export default InputOutputs