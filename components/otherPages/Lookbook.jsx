import React from "react";
import Image from "next/image";

export default function Lookbook() {
  return (
    <>
      <div id="smsa-order">
        <img
          src="https://www.ahmedalmaghribi.com/wp-content/plugins/smsa-shipping-official/images/logoEn.png"
          width={150}
          height={35}
          alt="logo"
        />
        <h3 className="wp-heading-inline fs-2 text-center">Orders Dashboard</h3>
        <div id="example_wrapper">
          <div className="row">
            <div className="col-sm-12 col-md-6">
              <div className="table_length d-flex align-items-center">
                <label className="me-2">
                  Show
                  <select className="text-dark ms-2 " name="50" id="">
                    <option className="text-black " value="10">
                      10
                    </option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  Entries
                </label>
              </div>
            </div>

            <div className="col-sm-12 col-md-6">
              <div className="search_box d-flex justify-content-md-end">
                <input
                  type="text"
                  className="form-control w-25"
                  placeholder="Search"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
