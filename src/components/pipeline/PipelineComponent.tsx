import type { PipelineComponentStateEnum } from "../../enums";
import StatusIndicator from "./StatusIndicator";

interface ComponentButtonProps {
    state: PipelineComponentStateEnum;
    isSelected: boolean;
    label: string;
    content: string;
    onClick: Function
}

function PipelineComponent(props: ComponentButtonProps) {
    return (
        <>
            <div className="flex flex-col">
                <div className="flex flex-row gap-2 p-3 justify-center">
                    <StatusIndicator state={props.state} />
                    <label>{props.label}</label>
                </div>
                <button className={"!text-6xl !p-5 !bg-gray-200 ".concat(props.isSelected ? 'selected' : '')}
                    onClick={() => props.onClick()}
                    id={props.label}>
                    {props.content}
                </button>
            </div>
        </>
    );
};

export default PipelineComponent