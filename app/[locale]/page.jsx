// import Loader from "@/components/loader/Loader";
import HomePage8 from "./(homes)/home-8/page";
import {useTranslations} from 'next-intl';

export const metadata = {
  title: "Buy Best Perfumes Online | Ahmed Al Maghribi Perfumes",
  description: "Buy Best Perfumes Online Ahmed Al Maghribi Perfumes.",
  icons: {
      icon: "/assets/images/ahmed-favicon.png",
  },
};
export default function Home() {
  const t = useTranslations();
  return (
    <>
    {/* <Loader/> */}
      {/* <h1>{t('title')}</h1> */}
      <HomePage8 />
    </>
  );
}
