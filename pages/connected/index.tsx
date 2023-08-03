import React, { useEffect, useState, useRef } from 'react';
import FavoriteModal from "@/component/FavoriteModal"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCopy,  faPlay } from '@fortawesome/free-solid-svg-icons';
import { db } from '../../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import Accordion from '@/component/Accordion';
const ChattingLog = () => {
  const storedData = localStorage.getItem('tableData')
  const storeInfo = localStorage.getItem('info')
  const tableData = JSON.parse(storedData)
  const hostInfo = JSON.parse(storeInfo)
  const [content, setContent] = useState('')
  const [chatLog, setChatLog] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMessage, setModalMessage] = useState('')
  const [displayChatLog, setDisplayChatLog] = useState([])
  const [table, setTable] = useState<any[]>([])
  const [error, setError] = useState('');
  const MAX_LITMIT_MESSAGES = 10
  const { currentuser } = useAuth()
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const handleChange = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };
  const queryTable = async () => {
    setTable([])
    setError('')
    setIsLoading(true);
    try{
      const res = await fetch('/api/table', {
        method: 'POST',
        headers: {
          'Content-Type' : 'application/json'
        },
        body: JSON.stringify({
          info: hostInfo,
          msg: modalMessage
        })
      })
      if (res.ok){
        const data = await res.json()
        setTable(data)
        setError('')
      }else {
        setError('Failed to fetch data.');
      }
    } catch (error) {
      setError('Error occurred while fetching data.');
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    if (modalMessage) {
      queryTable();
    }
  }, [modalMessage]);
  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const chatHistoryRef = doc(db, 'chat history', currentuser.uid);
        const docSnap = await getDoc(chatHistoryRef);
        if (docSnap.exists()) {
          const chatHistoryData = docSnap.data();
          // Set the chat log data to display on the page
          setDisplayChatLog(chatHistoryData.chatLog || []);
          setChatLog(chatHistoryData.chatLog || []);
        }
      } catch (error) {
        console.error('Error fetching chat history from Firestore:', error);
      }
    };

    fetchChatHistory();
  }, [currentuser]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Function to scroll to the bottom of the messages
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  useEffect(() => {
    if (displayChatLog.length === 0) {
      return;
    }
    const chatHistoryRef = doc(db, 'chat history', currentuser.uid);
    setDoc(chatHistoryRef, { chatLog: displayChatLog }, { merge: true });
    scrollToBottom()
  }, [displayChatLog])

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filterRoles = ["user", "assistant", "system"];

    const updatedChatLog = [...chatLog, { role: 'user', content: content}]
    const sliceChatLog = updatedChatLog.slice(-MAX_LITMIT_MESSAGES).filter(message => filterRoles.includes(message.role));
    setDisplayChatLog((prevChatLog) => [...prevChatLog, { role: 'user', content: content }]);
    const res = await fetch('/api/openai', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {role: 'system', content: 'You are a professional database developer. You can create SQL query with high accuracy.'},
          {role: 'user', content: 'I am using PostgreSQL. I have a database with the following description in CSV format. Each row is a table. The first value of every rows is the table name, and the next values are all columns of that table.'},
          {role: 'user', content: JSON.stringify(tableData)},
          {role: 'user', content: 'I will describe my data requirements, you will provide the SQL query for me to get the data I want.'},
          {role: 'user', content: 'Note that you must not say anything else. You must provide me only the SQL query'},
          {role: 'user', content: 'Example format for the return message: "SELECT * FROM users ORDER BY user_id ASC"'},
          {role: 'user', content: 'Here is our conversation:'},
          ...sliceChatLog,
        ] 
      }),
    }).then((res) => res.json());
    setChatLog(sliceChatLog)
    setChatLog((prevChatLog) => [...prevChatLog, { role: 'assistant', content: res.firstResponse }]);
    setDisplayChatLog((prevChatLog) => [...prevChatLog, { role: 'assistant', content: res.firstResponse }]);
    setContent('');
  };

  return (
    <div className="container mx-auto w-full mb-20 mt-20">
      <div className='flex justify-center items-center sticky top-20 z-20 '>
      <Accordion title={<>
        <div><b>Database name: </b>{hostInfo.dbname}</div>
      </>}>
        <div><b>Database name: </b>{hostInfo.dbname}</div>
        <div><b>Username: </b>{hostInfo.user} </div>
        <div><b>Host:</b> {hostInfo.host}</div>
      </Accordion>
      </div>
      <div className="flex flex-col space-y-4">
        {displayChatLog.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start flex flex-row items-center'}`}>
            <div className={`${message.role === 'user' ? 'bg-button text-white lg:mr-10' : 'lg:ml-10 border-2 border-slate-500'} relative rounded-xl p-3 max-w-[280px] md:max-w-md `}>
              <div className={`${message.role != 'user' ? "pr-4" : "" }`}>{message.content}</div>
              {message.role !== 'user' && (<button className="absolute top-0 right-0 outline-none m-1 px-1 text-button rounded-xl" 
                  onClick={() => {
                    navigator.clipboard.writeText(message.content)
                  }}>
                    <FontAwesomeIcon
                      icon={faCopy}
                      style={{fontSize: 16}}
                      className="hover:text-red-300"
                    />
                  </button>
              )}
            </div>
              {message.role !== 'user' && (
                  <button className="bg-button hover:bg-red-300 outline-none p-2 ml-2 text-white rounded-xl hidden md:block" 
                  onClick={() => {
                    setModalMessage(message.content);
                    setModalOpen(true);
                  }}>
                    <FontAwesomeIcon
                      icon={faPlay}
                      style={{fontSize: 18}}
                      className="hover:bg-red-300"
                    />
                  </button>
                )
              }
              
          </div>
        ))}
        {
                modalOpen && 
                <FavoriteModal isOpen={modalOpen} handleClose={() => setModalOpen(!modalOpen)}>
                  <div className="flex flex-col justify-between h-full w-full">
                    <div className=" overflow-y-auto overflow-x-auto">
                      {error && <div className="w-full text-center text-3xl m-8">{error}</div>}
                      {isLoading ? (
                          <div className="max-w-full text-center text-3xl m-8">Loading...</div>
                      ):
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700t">
                        <thead>
                          <tr className='font-semibold'>
                          {table.length > 0 &&
                              Object.keys(table[0]).map((column) => (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase" key={column}>{column}</th>
                              ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {table.map((row, index) => (
                            <tr key={index}>
                              {Object.values(row).map((value, colIndex) => (
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800 dark:text-gray-200 " key={colIndex}><>{value}</></td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      }
                    </div>
                  </div>
                </FavoriteModal>
              }
        <div ref={messagesEndRef} />
      </div>
      
      <form className="flex justify-center items-center bg-white shadow border-t-2 rounded p-3 fixed bottom-0 left-0 w-full" onSubmit={handleSubmit}>
        <div className="flex rounded-3xl border border-gray-700  w-3/4">
          <textarea
            ref={textareaRef}
            role='textbox'
            rows={1}
            className="flex-grow h-auto resize-none overflow-y-auto max-h-[80px] px-4 py-2 bg-transparent text-black focus:outline-none"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              handleChange();
            }}
            placeholder="Input your data requirements here"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSubmit(e);
              }
            }}
          ></textarea>
          
        </div>
        <button
            type="submit"
            className="bg-button rounded-3xl text-white px-4 py-2 font-semibold focus:outline-none hover:bg-red-300 transition-colors duration-300"
          >
            Ask
          </button>
      </form>
    </div>
  );
};

export default ChattingLog;
