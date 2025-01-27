'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

const MenuContext = createContext();

export function MenuProvider({ children }) {
  const [categoriesSubCategories, setCategoriesSubCategories] = useState([]);
  const [vatTax, setVatTax] = useState(0.00);
  const [shippingServiceCharges, setshippingServiceCharges] = useState([]);
  const [currency, setCurrency] = useState('د.إ');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getCategoriesSubCategories() {
    
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/productCategoriesTemp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({}), // Add any data you want to send in the body, if needed
          });
     
          if (!response.ok) {
            throw new Error('Failed to submit the data. Please try again.');
          }
     
          // Handle response if necessary
          const data = await response.json();
          if(data && data.productCategories.length > 0) {
            setError(null);
            setCategoriesSubCategories(data.productCategories);
          } else {
            setCategoriesSubCategories(null);
            setError(data);
          }

          if(data && data.tax) {
            setError(null);
            setVatTax(data.tax);
          } else {
            setVatTax(null);
            setError(data);
          }

          if(data && data.shipping_service_charges) {
            setError(null);
            setshippingServiceCharges(data.shipping_service_charges);
          } else {
            setshippingServiceCharges(null);
            setError(data);
          }

          if(data && data.currency) {
            setError(null);
            setCurrency(data.currency);
          } else {
            setCurrency(null);
            setError(data);
          }
          // console.log(data);
        } catch (error) {
          // Capture the error message to display to the user
          setError(error.message);
          setIsLoading(false);
          console.error(error);
        } finally {
            setError(null);
            setIsLoading(false);
        }
      }

      getCategoriesSubCategories();
  }, []);

  return (
    <MenuContext.Provider value={{ categoriesSubCategories, isLoading, error, vatTax, shippingServiceCharges, currency }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  return useContext(MenuContext);
}