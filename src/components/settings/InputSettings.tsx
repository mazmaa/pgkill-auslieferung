import { useState } from "react";
import { ServiceManager } from "../../services/ServiceManager";
import InputFileService from "../../services/input/InputFileService";
import FilePicker from "./FileComponents/FilePicker";

function InputSettings() {
    const [inputService, setInputService] = useState(ServiceManager.instance.inputService.name);
    const [inputFile, setInputFile] = useState(null);

    return (
        <>
            <label>
                Pick an Input Service:
                <select className="bg-gray-100 border-1 border-gray-400 rounded-sm px-2 mx-2"
                    value={inputService}
                    onChange={event => {
                        ServiceManager.instance.setInputServiceByName(event.target.value);
                        setInputService(event.target.value);
                    }}>

                    {ServiceManager.instance.inputServices.map(inputService =>
                        <option value={inputService.name} key={inputService.name}>{inputService.name}</option>
                    )}

                </select>
            </label>
            {inputService === "File Input" && <FilePicker file_={getFileInputService().file} onFileChanged={handleFileChanged} />}
        </>
    );
}

function getFileInputService(): InputFileService {
    return ServiceManager.instance.inputServices.find(is => is instanceof InputFileService)!;
}

function handleFileChanged(file: File) {
    let inputService = getFileInputService();
    inputService!.file = file;
    inputService?.initialize();
}

export default InputSettings