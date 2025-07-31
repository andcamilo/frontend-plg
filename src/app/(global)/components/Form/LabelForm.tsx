const LabelForm = ({ text, name }: { text: string; name: string }) => {
  return (
    <label htmlFor={name} className="block text-sm font-medium text-white">
      {text}
    </label>
  );
};

export default LabelForm;
