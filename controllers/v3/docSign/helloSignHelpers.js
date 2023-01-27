const moment = require("moment");

/**
 *
 * @param {{
 * street:string|null;
 * apt:string|null;
 * zipCode: string|null;
 * City: {
 *  name:string;
 *  Province: {
 *   name:string;
 *  }
 * } | null;
 * }} address
 *
 * @description
 * Returns formatted address [street apt province_name, city_name zipCode]
 * @returns {string}
 */
const generateAddress = (address) => {
  if (!address) return { address: "N/A", province: "N/A" };

  const street = `${address?.street ?? "N/A"} ${address?.apt ?? ""}`;
  const province = address?.City?.Province?.name;
  const city = address?.City?.name;
  const zipCode = address?.zipCode;
  return {
    address: `${street} ${province ?? ""}, ${city ?? ""} ${
      zipCode ?? ""
    }`.trim(),
    province: province ?? "N/A",
  };
};

/**
 *
 * @param {{
 *  Feature: {
 *   name: string;
 *   interior: boolean;
 *  };
 * }[]} features
 * @description
 * Returns comma joined interior and exterior string
 * @returns { { address:string;
 *            province:string; } }
 */
const generateFeaturesText = (features) => {
  if (!features) {
    return {
      interior: "N/A",
      exterior: "N/A",
    };
  }

  const interior = [];
  const exterior = [];

  features.forEach((item) => {
    if (item?.Feature?.name !== null) {
      if (item.Feature.interior) {
        interior.push(item.Feature.name);
      } else {
        exterior.push(item.Feature.name);
      }
    }
  });

  return {
    interior: interior.length !== 0 ? interior.join(", ") : "N/A",
    exterior: exterior.length !== 0 ? exterior.join(", ") : "N/A",
  };
};

/**
 *
 * @param {string} closingDate
 * @param {number|string} termMonths
 * @returns
 */
const generateTermsForContract = (closingDate, termMonths) => {
  const termDate = moment(closingDate);
  const termStartDate = termDate.format("Do MMMM");
  const termStartYear = termDate.format("MMMM Do YY").split(" ")[2];
  const termEndDate = termDate.add(+termMonths, "months").format("Do MMMM YY");
  const termEndYear = termEndDate.split(" ")[2];
  const termEnd = termEndDate.split(" ");
  return [
    // TERM_PERIOD
    {
      name: "TERM_PERIOD",
      type: "text",
      value: +termMonths,
    },
    // TERM_START (exclude year)
    {
      name: "TERM_START",
      type: "text",
      value: termStartDate,
    },
    // TERM_START_YEAR (last two letters)
    {
      name: "TERM_START_YEAR",
      type: "text",
      value: termStartYear,
    },
    // TERM_END (exclude year)
    {
      name: "TERM_END",
      type: "text",
      value: termEnd[0] + " " + termEnd[1],
    },
    // TERM_END_YEAR (last two letters)
    {
      name: "TERM_END_YEAR",
      type: "text",
      value: termEndYear,
    },
  ];
};

/**
 *
 * @param {number|string} rentPayment
 * @param {number|string} rentSavings
 * @returns
 */
const getRentInfoForContract = (rentPayment, rentSavings) => {
  return [
    // RENT_PAYMENT
    {
      name: "RENT_PAYMENT",
      type: "text",
      value: rentPayment ?? "N/A",
    },
    // RENT_SAVINGS
    {
      name: "RENT_SAVINGS",
      type: "text",
      value: rentSavings ?? "N/A",
    },
  ];
};

const completeBuyerSellerContractAutoGeneration = (
  property,
  closingDate,
  termMonths,
  rentPayment,
  rentSavings
) => {
  const [month, day, year] = moment().format("MMMM Do YY").split(" ");

  // Expiry for contract
  const deadline = moment()
    .add(7, "days")
    .hour(23)
    .minutes(59)
    .second(0)
    .format("MMMM Do YYYY, h:mm:ss a");

  const features = generateFeaturesText(property?.PropertyFeatures);
  const { address, province } = generateAddress(
    property?.PropertyAddresses?.[0]
  );

  return [
    // ---- Option to purchase contract ----
    // * Auto insert Current day, month, year
    {
      name: "DAY",
      type: "text",
      value: day,
    },
    {
      name: "MONTH",
      type: "text",
      value: month,
    },
    {
      name: "YEAR",
      type: "text",
      value: year,
    },
    {
      name: "PROPERTY_ADDRESS",
      type: "text",
      value: address,
    },
    // TERMS
    ...generateTermsForContract(closingDate, termMonths),
    // RENT
    ...getRentInfoForContract(rentPayment, rentSavings),
    {
      name: "PROPERTY_PROVINCE",
      type: "text",
      value: province,
    },
    // OPTION PURCHASE ITEM
    {
      name: "PROPERTY_PRICE",
      type: "text",
      value: property.price,
    },
    // INTERIOR FEATURES
    {
      name: "PROPERTY_INTERIOR",
      type: "text",
      value: features.interior,
    },
    // EXTERIOR FEATURES
    {
      name: "PROPERTY_EXTERIOR",
      type: "text",
      value: features.exterior,
    },
    // SPECIAL PROVISIONS
    {
      name: "DEADLINE",
      type: "text",
      value: deadline,
    },
  ];
};

const helloSignHelpers = {
  completeBuyerSellerContractAutoGeneration,
};

const helloSignKeys = {
  HELLOSIGN_KEY:
    process.env.HELLOSIGN_KEY ??
    "a7e9246ce67fc1af21c1ccc22237dd2f53255d3af64ede7f2332ba6aad1cc339",
  CLIENT_ID: process.env.CLIENT_ID ?? "67ae825a9d5eb0e014d263ea51fb5d75",
  BUYER_SELLER_TEMPLATE_ID:
    process.env.BUYER_SELLER_TEMPLATE_ID ??
    "903e289f997a89cba5e41403322d06996eb2a959",
  SELLER_TEMPLATE_ID:
    process.env.SELLER_TEMPLATE_ID ??
    "0998f35697105a5575669d5ab360aff0a797d11c",
  MODE: +(process.env.HELLOSIGN_MODE ?? 1),
};

module.exports = {
  helloSignHelpers,
  helloSignKeys,
};
