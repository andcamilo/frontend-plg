import React from "react";
import Select, { SingleValue } from "react-select";
import ReactCountryFlag from "react-country-flag";
import countries from "world-countries";

interface Option {
  value: string;       
  dialCode: string;    
  displayName: string;
  flag: string;       
  label: string;   
}

interface CountrySelectProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  className?: string;
}

function getDisplayName(country: any): string {
  const common = country?.name?.common ?? "";
  const nativeObj = country?.name?.nativeName ?? {};
  const nativeKeys = Object.keys(nativeObj);

  if (nativeKeys.length > 0) {
    const firstNativeLangKey = nativeKeys[0];
    const nativeCommon = nativeObj[firstNativeLangKey]?.common ?? "";
    if (nativeCommon && nativeCommon !== common) {
      return `${common} (${nativeCommon})`;
    }
  }
  return common;
}


const options: Option[] = countries.map((country) => {
  const root = country.idd?.root ?? "";
  const suffix = country.idd?.suffixes?.[0] ?? "";
  const dialCode = root && suffix ? `${root}${suffix}` : "";
  const displayName = getDisplayName(country);

  return {
    value: country.cca2,           // e.g. "FI"
    dialCode,                      // e.g. "+358"
    displayName,                   // e.g. "Finland (Suomi)"
    flag: country.cca2,           // for ReactCountryFlag
    label: `${displayName} ${dialCode}`, // used internally by react-select to filter
};
}).filter((opt) => opt.dialCode);

const customStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minWidth: "110px",
    height: "56px", // Maintain the height
    backgroundColor: "#2d3748",
    color: "#fff",
    padding: "4px",
    borderRadius: "0.5rem",
    borderColor: state.isFocused ? "#718096" : "#4a5568",
    boxShadow: state.isFocused ? "0 0 0 1px #718096" : "none",
    display: "flex",
    alignItems: "center",
    "&:hover": {
      borderColor: "#718096",
    },
  }),
  singleValue: (base: any) => ({
    ...base,
    display: "flex",
    alignItems: "center",
    height: "100%",
    margin: "0", 
    gap: "0.5rem", 
  }),
  valueContainer: (base: any) => ({
    ...base,
    display: "flex",
    alignItems: "center",
    height: "100%", // Ensure full height alignment
    padding: "0",
  }),
  menu: (base: any) => ({
    ...base,
    backgroundColor: "#2d3748",
    zIndex: 9999,
    borderRadius: "0.5rem",
    minWidth: "230px",
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isFocused ? "#4a5568" : "#2d3748",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "10px",
  }),
  dropdownIndicator: (base: any) => ({
    ...base,
    padding: 4,
    color: "#fff",
    "&:hover": {
      color: "#fff",
    },
  }),
  indicatorSeparator: (base: any) => ({
    ...base,
    display: "none",
  }),
};
const CountrySelect: React.FC<CountrySelectProps> = ({
  name,
  value,
  onChange,
  isDisabled,
  className,
}) => {
  const handleSelectChange = (selected: SingleValue<Option>) => {
    if (selected) onChange(selected.value);
  };

  const selectedOption = options.find((o) => o.value === value);

  return (
    <Select
      name={name}
      value={selectedOption}
      onChange={handleSelectChange}
      options={options}
      isDisabled={isDisabled}
      className={className}
      styles={customStyles}
      components={{
        Option: (props) => (
          <div
            {...props.innerRef}
            {...props.innerProps}
            className="flex items-center cursor-pointer"
          >
            <ReactCountryFlag
              countryCode={props.data.flag}
              svg
              style={{ width: "1.25em", height: "1.25em" }}
            />
            <span>
              {`${props.data.displayName} ${props.data.dialCode}`}
            </span>
          </div>
        ),
        SingleValue: (props) => (
          <div className="flex items-center">
            <ReactCountryFlag
              countryCode={props.data.flag}
              svg
            />
            <span>{props.data.dialCode}</span>
          </div>
        ),
      }}
    />
  );
};

export default CountrySelect;
