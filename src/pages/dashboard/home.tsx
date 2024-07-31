import React, { useState } from 'react';
import SideMenu from '@/app/components/sideMenu';

const Home: React.FC = () => {
  const [message, setMessage] = useState("Hello Worldddd");

  const toggleMessage = () => {
    setMessage(prevMessage => prevMessage === "Hello Worldddd" ? "Bye Worldddd" : "Hello Worldddd");
  };

  return (
    <div className="flex">
      <SideMenu />
      <div className="flex items-center justify-center min-h-screen flex-grow flex-col">
        <h1 className="text-4xl font-bold">{message}</h1>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={toggleMessage}
        >
          Toggle Message
        </button>
      </div>
    </div>
  );
}

export default Home;
