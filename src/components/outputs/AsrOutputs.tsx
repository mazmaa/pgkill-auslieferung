import { useEffect, useState } from "react";
import { ServiceManager } from "../../services/ServiceManager";
import type { AsrResult } from "../../services/asr/AsrServiceBase";

function AsrOutputs() {
    const [asrResults, setAsrResults] = useState<AsrResult[]>([]);

    // react to output changes
    useEffect(() => {
        const sub = ServiceManager.instance.asrOutputs.subscribe(outputs => setAsrResults(outputs));
        return () => sub.unsubscribe();
    })

    return (
        <>
            <div className='flex flex-col  gap-2'>
                {asrResults.map(result => <li key={result.timestamp}>{result.content}</li>).reverse()}
            </div>
        </>
    );
}

export default AsrOutputs