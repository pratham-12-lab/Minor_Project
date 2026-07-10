import React from 'react';

const SimpleChatbot = () => {
  console.log('SimpleChatbot rendering!');
  
  return (
    <div 
      className="fixed bottom-6 right-6 w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white cursor-pointer text-2xl"
      style={{ zIndex: 9999 }}
      onClick={() => alert('Chatbot clicked!')}
    >
      🤖
    </div>
  );
};

export default SimpleChatbot;