import { Button } from "../../util/Buttons";
import { Link, useNavigate } from "react-router-dom";
import '../../css/user/UPic.css';

const WishList = () => {

    const contentsExist = true;

    return (
        <div className="wishList_wrap"> 
            <div className="wishList_contents">
                <div className="title_area">
                    <h2>WISH LIST</h2>    
                </div>
                <div className="table_wrap">
                {contentsExist ? (
                        <table className="contents_wrap">
                            <colgroup>
                                <col style={{width : "10px"}} />
                                <col style={{width : "40px"}} />
                                <col style={{width : "60px"}} />
                                <col style={{width : "40px"}} />
                                <col style={{width : "30px"}} />
                                <col style={{width : "35px"}} />
                                <col style={{width : "30px"}} />
                                <col style={{width : "40px"}} />
                                <col style={{width : "40px"}} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th scope="col"><input type="checkbox"/></th>
                                    <th scope="col">이미지</th>
                                    <th scope="col">상품정보</th>
                                    <th scope="col">판매가</th>
                                    <th scope="col">적립금(포인트)</th>
                                    <th scope="col">배송구분</th>
                                    <th scope="col">배송비</th>
                                    <th scope="col">합계</th>
                                    <th scope="col">선택</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="" style={{textAlign : "center"}}><input type="checkbox"/></td>
                                    <td style={{textAlign : "center"}}>이미지</td>
                                    {/* 이후 상품정보에 상품명, 옵션 선택 넣어야함 */}
                                    <td style={{textAlign : "left"}}>상품정보</td>
                                    <td>판매가</td>
                                    <td>포인트</td>
                                    <td>배송구분</td>
                                    <td>배송비</td>
                                    <td>합계</td>
                                    <td>주문하기, 장바구니 담기, 삭제</td>
                                </tr>
                            </tbody>
                        </table>
                    ) : (
                        <p>관심상품 내역이 존재하지 않습니다.</p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default WishList;