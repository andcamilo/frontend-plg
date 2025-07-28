const LabelForm = ({ text, name }: { text: string; name: string }) => {
  return (
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {text}
    </label>
  );
};

export default LabelForm;
