import React from 'react';

const RecordPage = ({ params }: { params: { id: string } }) => {
  return (
    <div className="p-8 text-white">
      <h1>Hello world</h1>
      <p>ID: {params.id}</p>
    </div>
  );
};

export default RecordPage; 