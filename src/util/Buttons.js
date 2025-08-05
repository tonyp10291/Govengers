import "../css/util/Buttons.css";

export const Button = ({text, type, style, onClick}) => {
    const btnType = [
        "logo",
        "movePage",
        "submit",
        "cancel"
    ].includes(type) ? type : "default";

    if (btnType === "submit"){
        return (
            <>
                <button
                    type="submit"
                    className={["btn", `btn_${btnType}`].join(" ")}
                    style={style}
                    onClick={onClick}
                >{text}
                </button>
            </>
        );
    } else {
        return (
            <>
                <button
                    type="button"
                    className={["btn", `btn_${btnType}`].join(" ")}
                    style={style}
                    onClick={onClick}
                >{text}
                </button>
            </>
        );
    }

}