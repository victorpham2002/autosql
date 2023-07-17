import React, { useState } from 'react';

const ChattingLog = () => {
  const storedData = localStorage.getItem('tableData')
  const tableData = JSON.parse(storedData)
  const [content, setContent] = useState('');
  const [chatLog, setChatLog] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setChatLog((prevChatLog) => [...prevChatLog, { role: 'user', content: content }]);
    const res = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {role: 'user', content: 'I want you to act as a professional database developer. You can create SQL query with high accuracy.'},
          {role: 'user', content: 'I will describe my data requirements, you will provide the SQL query for me to get the data I want.'},
          {role: 'user', content: 'I am using PostgreSQL. I have a database with tables, their columns and data types like this.'},
          {role: 'user', content: JSON.stringify(tableData)},
          {role: 'user', content: content},
          {role: 'user', content: 'Note that you must not say anything else. You must provide me only the SQL query'},
          {role: 'user', content: 'Example format for the return message: "SELECT * FROM users"'}
        ] 
      }),
    }).then((res) => res.json());

    setChatLog((prevChatLog) => [...prevChatLog, { role: 'assistant', content: res.firstResponse }]);
    setContent('');
  };

  return (
    <div className="container mx-auto w-full m-4 mt-24">
      <div className="flex flex-col space-y-4">
        {chatLog.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`${message.role === 'user' ? 'bg-button text-white' : 'border-2 border-slate-500'} rounded-xl p-3 max-w-[280px] md:max-w-md`}>
              {message.content}
            </div>
          </div>
        ))}
      </div>
      <form className="bg-white shadow border-t-2 rounded p-3 fixed bottom-0 left-0 w-full" onSubmit={handleSubmit}>
        <div className="flex rounded-3xl border border-gray-700 mx-auto w-3/4">
          <textarea
            rows={1}
            className="flex-grow resize-none px-4 py-2 bg-transparent text-black focus:outline-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Input your data requirements here"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit(e);
              }
            }}
          ></textarea>
          <button
            type="submit"
            className="bg-button rounded-3xl text-white px-4 py-2 font-semibold focus:outline-none hover:bg-red-300 transition-colors duration-300"
          >
            Ask
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChattingLog;
