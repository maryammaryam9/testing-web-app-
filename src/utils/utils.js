export const findUpper = (string) => {
  let upperCaseLetters = [];
  let lowerCaseLetters = [];

  for (let i = 0; i < string.length; i++) {
    const char = string.charAt(i);

    if (char !== " ") {
      if (char === char.toUpperCase() && char !== char.toLowerCase()) {
        upperCaseLetters.push(char);
      } else if (char === char.toLowerCase() && char !== char.toUpperCase()) {
        lowerCaseLetters.push(char);
      }
    }
  }

  const extractedString = upperCaseLetters.length > 0 ? upperCaseLetters : lowerCaseLetters;

  if (extractedString.length > 1) {
    return extractedString[0] + extractedString[1];
  } else {
    return extractedString[0] || "";
  }
};

export const TimeConversion = (dateValue) => {
  const date = new Date(dateValue);
  const options = { year: "numeric", month: "long", day: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", options);
  return formattedDate;
};

export const cache = { collection: { qualitive: {}, industry: {} }, overall: { overview: {}, peers: {} } };

export const industry_cache = {
  INDUSTRY_OVERVIEW: {},
  COMPREHENSIVE_ANALYSIS: {},
  OPPURTUNITY_ANALYSIS: {},
  ANSOFF_MATRIX_ANALYSIS: {},
};

export const research_cache = {
  collection: { financial_analysis: {}, qualitative_assessment: {} },
  overall: { overview: {}, recommendations: {} },
};

export const PascalCase = ({ str }) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
