import React from "react";
// import { useTranslations } from "next-intl";

export default function AdditionalInfo({ product_name, video, title }) {
  // const t = useTranslations();
  function cleanProductName(productName) {
    // Step 1: Remove any non-alphanumeric characters except for spaces
    const dynamicKey = productName.replace(/[^a-zA-Z0-9\s]/g, '') + ' Notes';
  
    // Step 2: Words to remove
    const wordsToRemove = ['&', ' &', '& ', ' & ', 'amp', ' amp', 'amp ', ' amp ', ';', ' ;', '; ', ' ; '];
  
    // Step 3: Remove the words from the dynamic key (case insensitive)
    let cleanString = dynamicKey;
    wordsToRemove.forEach(word => {
      const regex = new RegExp(word, 'gi'); // 'gi' for global and case-insensitive replacement
      cleanString = cleanString.replace(regex, '');
    });
  
    // Step 4: Replace multiple spaces with a single space
    cleanString = cleanString.replace(/\s+/g, ' ').trim(); // Trim to remove leading/trailing spaces
  
    return cleanString;
  }
  return (
    <>
      {/* <div className="d-lg-flex align-items-lg-center mb-5">
        <div className="image-wrapper col-lg-6">
          <img
            style={{ height: "fit-content" }}
            className="h-auto"
            loading="lazy"
            src="https://www.ahmedalmaghribi.com/wp-content/uploads/2024/03/Top-Notes-1.jpg"
            alt="image"
          />
        </div>
        <div className="content-wrapper col-lg-6 px-lg-4">
          <h3 className="mb-3 text-white">The Company</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet sapien
            dignissim a elementum. Sociis metus, hendrerit mauris id in. Quis
            sit sit ultrices tincidunt euismod luctus diam. Turpis sodales orci
            etiam phasellus lacus id leo. Amet turpis nunc, nulla massa est
            viverra interdum. Praesent auctor nulla morbi non posuere mattis.
            Arcu eu id maecenas cras.
          </p>
        </div>
      </div>

      <div className="d-lg-flex align-items-lg-center mb-5">
        <div className="content-wrapper col-lg-6 px-lg-4">
          <h3 className="mb-3 text-white">The Company</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet sapien
            dignissim a elementum. Sociis metus, hendrerit mauris id in. Quis
            sit sit ultrices tincidunt euismod luctus diam. Turpis sodales orci
            etiam phasellus lacus id leo. Amet turpis nunc, nulla massa est
            viverra interdum. Praesent auctor nulla morbi non posuere mattis.
            Arcu eu id maecenas cras.
          </p>
        </div>
        <div className="image-wrapper col-lg-6">
          <img
            style={{ height: "fit-content" }}
            className="h-auto"
            loading="lazy"
            src="https://www.ahmedalmaghribi.com/wp-content/uploads/2024/03/middle-notes.jpg"
            alt="image"
          />
        </div>
      </div>

      <div className="d-lg-flex align-items-lg-center mb-5">
        <div className="image-wrapper col-lg-6">
          <img
            style={{ height: "fit-content" }}
            className="h-auto"
            loading="lazy"
            src="https://www.ahmedalmaghribi.com/wp-content/uploads/2024/03/Base-Notes.jpg"
            alt="image"
          />
        </div>
        <div className="content-wrapper col-lg-6 px-lg-4">
          <h3 className="mb-3 text-white">The Company</h3>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Amet sapien
            dignissim a elementum. Sociis metus, hendrerit mauris id in. Quis
            sit sit ultrices tincidunt euismod luctus diam. Turpis sodales orci
            etiam phasellus lacus id leo. Amet turpis nunc, nulla massa est
            viverra interdum. Praesent auctor nulla morbi non posuere mattis.
            Arcu eu id maecenas cras.
          </p>
        </div>
      </div> */}
      <div dangerouslySetInnerHTML={{ __html: product_name }}></div>
      <div className="align-items-lg-center mb-5">
        <div className="col-lg-12 d-flex align-items-center justify-content-center mb-5">
          <h2 className="mb-3 text-white">
            { title }
          </h2>
        </div>
        {video &&
          <div className="image-wrapper col-lg-12">
            <video
              className="h-auto w-100"
              autoPlay
              loop
              muted
              controls
              src={`${process.env.NEXT_PUBLIC_API_URL}storage/${video}`} type="video/mp4" width={200}
              alt=""
            />
          </div>
        }
      </div>
    </>
  );
}
