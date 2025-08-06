import "../css/util/Buttons.css";

/*
버튼 사용법!
사용하고 싶은 곳에 아래 코드 추가하기

import { Button } from "경로/util/Buttons";

<Button text={"텍스트"} type={"타입"} style={{스타일, 스타일, ...}} onClick={실행시킬함수} />

type은 안적을시 기본 default임!
type 리스트
"logo" : 로고 이미지만 나옴. text는 쓰지 말 것.
"movePage_??px" : page이동시에 쓰는 스타일의 버튼. px에 따라 글씨 크기 다름
추가 하고싶은 type이 있다면 Button.css 안에 원하는 타입 css 넣고 btnType 안에 추가하기
(css안의 클래스명은 "btn_타입" 형식으로 기술)
*/


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