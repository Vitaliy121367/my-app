import "./Input.css"
const isValidElement = ({valid, touched,shouldValidate}) => {
    return !valid && touched && shouldValidate;
}

const Input = props => {
    const inputType = props.type || 'text'
    const htmlFor = `${inputType}-${Math.random()}`
    return (
        <div className="mb-3">
            <label htmlFor={htmlFor} className="form-label title">{props.label}</label>
            <input className="form-control" id={htmlFor}
                type={inputType}
                value={props.value}
                onChange={props.onChange}
            />
            {
                isValidElement(props)
                    ?
                    <span className="text-danger">{props.errorMessage ? props.errorMessage : "Error"}</span>
                    :
                    null
            }
        </div>
    )
}

export default Input