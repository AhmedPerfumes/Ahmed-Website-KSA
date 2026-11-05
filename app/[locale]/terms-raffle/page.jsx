import Footer14 from "@/components/footers/Footer14";
import TermsRaffle from "@/components/otherPages/TermsRaffle";
import React from "react";
export const metadata = {
    title: "Perfumes | Buy Best Perfumes Online | Ahmed Perfume",
    description: "Buy Best Perfumes Online Ahmed Perfume",
    icons: {
        icon: "https://www.ahmedalmaghribi.com/wp-content/uploads/2021/08/Ahmed-Logo-e1631552829722-100x100.png",
    },
};
function Tnc() {
    return (
        <div
            style={{
                backgroundImage: `url(/assets/background-ivory.webp)`,
            }}
        >
            <TermsRaffle />
            <Footer14 />
        </div>
    );
}

export default Tnc;
