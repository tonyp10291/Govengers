import React from "react";
import {
  CreditCardIcon,
  UserIcon,
  HeartIcon,
  BanknotesIcon,
  TicketIcon,
  BookOpenIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import styles from "../../css/user/Mypage.module.css";

const MENU_ITEMS = [
  { icon: CreditCardIcon, label: "ORDER", sub: "주문내역 조회" },
  { icon: UserIcon, label: "PROFILE", sub: "회원정보" },
  { icon: HeartIcon, label: "WISHLIST", sub: "관심상품" },
  { icon: BanknotesIcon, label: "MILEAGE", sub: "적립금" },
  { icon: TicketIcon, label: "COUPON", sub: "리뷰관리" },
  { icon: BookOpenIcon, label: "BOARD", sub: "문의내역 확인" },
  { icon: TruckIcon, label: "ADDRESS", sub: "배송 주소록 관리" },
];

const Mypage = () => (
  <div className={styles.mypageWrapper}>
    <div className={styles.mypageContainer}>
      <div className={styles.statusBox}>
        <div className={styles.statusHeader}>
          <span className={styles.statusTitle}>나의 주문처리 현황</span>
          <span className={styles.statusPeriod}>(최근 3개월 기준)</span>
        </div>
        <div className={styles.statusContent}>
          <div>
            <div className={styles.statusLabel}>입금전</div>
            <div className={styles.statusNum}>0</div>
          </div>
          <div>
            <div className={styles.statusLabel}>배송준비중</div>
            <div className={styles.statusNum}>0</div>
          </div>
          <div>
            <div className={styles.statusLabel}>배송중</div>
            <div className={styles.statusNum}>0</div>
          </div>
          <div>
            <div className={styles.statusLabel}>배송완료</div>
            <div className={styles.statusNum}>0</div>
          </div>
          <div className={styles.statusExtra}>
            <div>· 취소 : <b>0</b></div>
            <div>· 교환 : <b>0</b></div>
            <div>· 반품 : <b>0</b></div>
          </div>
        </div>
      </div>
      <div className={styles.menuGrid}>
        {MENU_ITEMS.map((item, i) => (
          <div className={styles.menuBox} key={i}>
            <item.icon className={styles.menuIcon} />
            <div className={styles.menuLabel}>{item.label}</div>
            <div className={styles.menuSub}>{item.sub}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Mypage;