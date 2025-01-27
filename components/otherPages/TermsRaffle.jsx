import { useTranslations } from "next-intl";
import React from "react";

export default function TermsRaffle() {
    const t = useTranslations();
    return (
        <section className="container mw-930 lh-30">
            <h2 className="section-title text-uppercase fw-bold mb-3 mt-3">
               {t("Shop & Win – Terms and Conditions")}
            </h2>
            {/* <h6 className="mb-3">    
      </h6> */}

            <ol className="mb-4 pb-3 fs-6">
                <li>{t("Purchase above AED 250 and Get a Chance to win")}</li>
                <li>
                    {t("By entering this raffle you agree to be bound by these terms and conditions Any raffle entry and participation instructions form part of these terms and conditions Any entries not complying with these terms and conditions willnot be valid")}
                </li>
                <li>
                    {t("This raffle is only open to UAE residents aged 18 years or over with a valid UAE driving license Any person who has entered the raffle and who is found to be under 18 years of age will automatically forfeit any prize AHMED ALMAGHRIBI PERFUMES reserves the right to require proof of identity and age")}
                </li>
                <li>
                    {t("The winning entries will be selected from all entries received by the closing date and prizes awarded in order of selection")}
                </li>
                <li>
                    {t("Prizes are non-transferable non-negotiable and no cash alternative will be available The person registered in the draw will be the only person entitled to the prize")}
                </li>
                <li>
                    {t("Any individual who is currently employed by AHMED AL MAGHRIBI PERFUMES or an organization involved in the competition is not eligible to participate")}
                </li>
                <li>
                    {t("Winners will be notified on the draw date 30th Jan 2025 via our social media channels or in-person events")}
                </li>
                <li>
                    {t("AHMED AL MAGHRIBI PERFUMES reserves the right to reject your entry and or award any prize to an alternative winner if the promoter has grounds to believe that you have breached any of these Terms and Conditions")}
                </li>
                <li>
                    {t("If a prize cannot be delivered within a 90 day period following the date of the draw using the details provided to Ahmed Al Maghribi Perfumes this prize will be forfeited")}
                </li>
                <li>
                    {t("Nothing in these terms and conditions shall limit AHMED AL MAGHRIBI PERFUMES liability for death or personal injury caused by its negligencefraud or any other matter for which liability may not be limited by law")}
                </li>
                <li>
                    {t("AHMED AL MAGHRIBI PERFUMES may amend these terms and conditions at any time Details of any significant changes will be published on the")}
                </li>
                <li>
                    {t("If you have any queries about the raffle please contact the AHMED AL MAGHRIBI PERFUMES")}
                </li>
                <li>
                    {t("There may at times be additional terms and conditions relating to specific prizes or draws These will be available on the website")}
                </li>
                <li>{t("This raffle draw is only applicable to UAE region")}</li>
            </ol>

            <h2 className="section-title text-uppercase fw-bold mb-3 mt-3">
                {t("Winning Logic:")}
            </h2>
            <li>
               {t("The three prize categories for each draw are as follows:")}
                <ol>
                    <li>{t("First Prize – 1 – Jetour T2")}</li>
                    <li>{t("Second Prize – 7 – iPhone 16 Pro Max")}</li>
                    <li>{t("Third Prize – AED 500 Cash Vouchers for 50 Winners")}</li>
                </ol>
            </li>
            <li>
                {t("If more than one participant has matched the winning selection correctly the participant whose entry was registered first will win the prize")}
            </li>
            <h6 className="mb-3"></h6>
        </section>
    );
}
