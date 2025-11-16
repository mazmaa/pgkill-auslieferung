interface LabelledContainerProps {
    label: string;
    children: React.ReactNode
}

function LabelledContainer(props: LabelledContainerProps) {

    return (
        <>
            <div className="mx-10">
                <h2 className="text-2xl font-bold ms-10">{props.label}</h2>
                <div className='p-6 mycontainer rounded-4xl h-fit w-full'>
                    {props.children}
                </div>
            </div>
        </>
    )
}

export default LabelledContainer