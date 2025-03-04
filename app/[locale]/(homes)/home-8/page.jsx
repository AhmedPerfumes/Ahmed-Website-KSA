import Footer14 from "@/components/footers/Footer14";
import Header14 from "@/components/headers/Header14";
// import Animation from "@/components/Animation";
import HomePage from "@/components/HomePage";
import MobileFooter2 from "@/components/footers/MobileFooter2";
import React from "react";
// import CanvasAnimation from "@/components/CanvasAnimation";
// import MobileAnimation from "@/components/MobileAnimation";
import NewsLetter from "@/components/modals/NewsLetter";
// import dynamic from 'next/dynamic'; 

// const MobileAnimation = dynamic(() => import('@/components/MobileAnimation'), {
//   loading: () => <p>Loading...</p>,
//   ssr: false, // Disable server-side rendering for this component
// });
export const metadata = {
    title: "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",
    description: "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",
    icons: {
        icon: "/assets/images/ahmed-favicon.png",
    },
};

export default function HomePage8() {
    return (
        <div
            style={{
                backgroundImage: `url(/assets/background-ivory.webp)`,
            }}
        >
            <NewsLetter />
            <Header14 />
            <div className="d-none d-lg-block">
                {/* CanvasAnimation will render first for large screens */}
                {/* <CanvasAnimation /> */}
            </div>
            <div className="d-sm-block d-md-none">
                {/* MobileAnimation will render for small screens */}
                {/* <MobileAnimation /> */}
            </div>
            <main id="">
                {/* Animation component will render after CanvasAnimation */}
                <HomePage />
                {/* <Animation /> */}
            </main>
            <section className="d-none d-md-block" style={{ height: "100%" }}>
                <Footer14 />
            </section>
            <section className="d-sm-block d-md-none bg-dark pt-5">
                <div className="MobileFooter">
                    <MobileFooter2 />
                </div>
            </section>
        </div>
    );
}
