// import Loader from "@/components/loader/Loader";
import HomePage8 from "./(homes)/home-8/page";
import {useTranslations} from 'next-intl';

export const metadata = {
  title: "Perfumes | Buy Best Perfumes Online | Ahmed Perfume",
  description: "Buy Best Perfumes Online Ahmed Perfume",
  icons: {
    icon: 'https://www.ahmedalmaghribi.com/wp-content/uploads/2021/08/Ahmed-Logo-e1631552829722-100x100.png',
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
