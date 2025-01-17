// @components/CountrySelect.tsx
import React from 'react';
import Select, { SingleValue } from 'react-select';
import ReactCountryFlag from 'react-country-flag';
import countryCodes from '@utils/countryCode';

interface Option {
  value: string;
  label: string;
  flag: string;
}

interface CountrySelectProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  isDisabled?: boolean;
  className?: string;
}

const options: Option[] = Object.entries(countryCodes).map(([code, dialCode]) => ({
  value: code,
  label: dialCode, // Display only the dial code for compactness
  flag: code,
}));

const customStyles = {
    control: (provided: any, state: any) => ({
        ...provided,
        backgroundColor: '#2d3748', // Tailwind's bg-gray-800
        color: '#fff',
        alignItems: 'center', // Centers content vertically
        justifyContent: 'center',
        borderRadius: '0.5rem', // Tailwind's rounded-lg
        minWidth: '100px', // Adjust as needed
        borderColor: '#4a5568', // Tailwind's gray-700
        boxShadow: state.isFocused ? '0 0 0 1px #718096' : 'none', // Add hover focus
        '&:hover': {
          borderColor: '#718096',
        },
        padding: '0', // Remove default padding
        margin: '0', // Remove unnecessary margin
      }),
  singleValue: (provided: any) => ({
    ...provided,
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: '#2d3748',
    zIndex: 9999,
    alignItems: 'center', // Centers content vertically
    justifyContent: 'center',
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#4a5568' : '#2d3748',
    color: '#fff',
    padding: '10px',
    cursor: 'pointer',
    alignItems: 'center', // Centers content vertically
    justifyContent: 'center',
  }),
  dropdownIndicator: (provided: any) => ({
    ...provided,
    padding: '4px', // Reduced the arrow width
    alignItems: 'center', // Centers content vertically
    justifyContent: 'center',
  }),
  indicatorSeparator: (provided: any) => ({
    ...provided,
    display: 'none', // Remove the separator for a cleaner look
    alignItems: 'center', // Centers content vertically
    justifyContent: 'center',
  }),
};

const CountrySelect: React.FC<CountrySelectProps> = ({ name, value, onChange, isDisabled, className }) => {
  const handleSelectChange = (selectedOption: SingleValue<Option>) => {
    if (selectedOption) {
      onChange(selectedOption.value);
    }
  };

  const selectedOption = options.find((option) => option.value === value);

  return (
    <Select
      name={name}
      value={selectedOption}
      onChange={handleSelectChange}
      options={options}
      styles={customStyles}
      isDisabled={isDisabled}
      className={className}
      components={{
        Option: (props) => (
          <div
            {...props.innerRef}
            {...props.innerProps}
            className="cursor-pointer"
          >
            <ReactCountryFlag
              countryCode={props.data.flag}
              svg
              style={{
                width: '1em',
                height: '1em',
                marginRight: '0.5em',
              }}
            />
            <span>{props.data.label}</span>
          </div>
        ),
        SingleValue: (props) => (
          <div className="flex items-center">
            <ReactCountryFlag
              countryCode={props.data.flag}
              svg
              style={{
                width: '1em',
                height: '1em',
                marginRight: '0.3em',
              }}
            />
            <span>{props.data.label}</span>
          </div>
        ),
      }}
    />
  );
};

export default CountrySelect;
