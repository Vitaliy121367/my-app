 
const Button = props => {
    return (
        <button 
            className="btn btn-outline-danger"
            disabled={props.disabled}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    )
}
 
export default Button