SELECT
'auvzymnyxf' AS company,
`ec_orders`.`id` AS ecOrderId,
`ec_orders`.`code` AS orderNo,
DATE_FORMAT(`ec_orders`.`created_at`, '%m/%d/%Y %h:%i:%s %p') AS orderDate,
DATE_FORMAT(CONVERT_TZ(`ec_orders`.`created_at`, 'SYSTEM', '-04:00'), '%m/%d/%Y %h:%i:%s %p') AS orderDate_GMT,
`ec_orders`.`status` AS ecOrderStatus,
`payments`.`payment_channel` AS payMethod,
`ec_customers`.`id` AS customerId,
`ec_customer_addresses`.`name` AS billName,
'AE' AS billCountry,
`ec_customer_addresses`.`state` AS billState,
`ec_customer_addresses`.`city` AS billCity,
`ec_customer_addresses`.`address` AS billAddress,
`ec_customer_addresses`.`email` AS billEmail,
`ec_customer_addresses`.`phone` AS billMobile,
`ec_order_addresses`.`name` AS shipName,
'AE' AS shipCountry,
`ec_order_addresses`.`state` AS shipState,
`ec_order_addresses`.`city` AS shipCity,
`ec_order_addresses`.`address` AS shipAddress,
`ec_order_addresses`.`email` AS shipEmail,
`ec_order_addresses`.`phone` AS shipMobile,
`payments`.`currency` AS currecncy,
`payments`.`charge_id` AS paymeId,
`ec_orders`.`shipping_amount` AS courier,
`ec_orders`.`shipping_amount_vat` AS courierVAT,
`ec_orders`.`service_amount` AS serviceAmt,
`ec_orders`.`service_amount_vat` AS serviceVAT,
`ec_orders`.`amount` AS grossAmount,
`ec_orders`.`discount_amount` AS discount,
'0' AS discountPer,
`ec_orders`.`sub_total` AS orderAmount,
`ec_orders`.`tax_amount` AS orderVAT,
`ec_orders`.`description` AS remarks,
'wc-processing' AS deliveryMode,
`ec_orders`.`salesOrderId`,
`ec_orders`.`isCancelled`,
`ec_orders`.`awb`
FROM `ec_orders`
LEFT JOIN `payments` ON `ec_orders`.`payment_id` = `payments`.`id`
LEFT JOIN `ec_customers` ON `ec_customers`.`id` = `ec_orders`.`user_id`
LEFT JOIN `ec_customer_addresses` ON `ec_customers`.`id` = `ec_customer_addresses`.`customer_id`
LEFT JOIN `ec_order_addresses` ON `ec_orders`.`id` = `ec_order_addresses`.`order_id`;




SELECT
`ec_order_product`.`id` AS LineId,
'varchar' AS SAPItemCode,
`ec_order_product`.`product_name` AS ItemName,
'Pieces' AS UoM,
`ec_products`.`sku` AS SKU,
`ec_order_product`.`product_id` AS ProductID,
`ec_order_product`.`qty` AS Qty,
`ec_order_product`.`price` AS Price, (Actual Price)
`ec_order_product`.`qty` * `ec_order_product`.`price` AS total_price,
`ec_order_product`.`discount_percent` AS DiscountPer,
`ec_order_product`.`total_price` / 100 * `ec_order_product`.`DiscountPer` AS DiscountPrice,
`ec_order_product.total_price` - `ec_order_product.DiscountPrice` AS NetAmount,
`ec_order_product`.`tax_amount` AS VAT,
`ec_order_product`.`NetAmount` / 100 * VAT AS VATAmt,
`ec_order_product`.`NetAmount` + `ec_order_product`.`VATAmt` AS GrossAmount,
IF(`ec_order_product`.`tax_amount` > 0, 1, 0) AS isTaxable,
'fee or line_item query to b provided by Farhan' AS lineItemType
FROM `ec_order_product`
LEFT JOIN `ec_products` ON `ec_order_product`.`product_id` = `ec_products`.`id`;