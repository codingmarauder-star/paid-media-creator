
import React from 'react';
import { LogMessage, LogStatus } from '../types';
import { SpinnerIcon, CheckCircleIcon, XCircleIcon, InfoIcon } from './IconComponents';

interface ProgressLogProps {
  messages: LogMessage[];
}

const getStatusStyles = (status: LogStatus) => {
  switch (status) {
    case LogStatus.SUCCESS:
      return {
        icon: <CheckCircleIcon className="w-5 h-5 text-green-400" />,
        textColor: 'text-green-300',
      };
    case LogStatus.ERROR:
      return {
        icon: <XCircleIcon className="w-5 h-5 text-red-400" />,
        textColor: 'text-red-300',
      };
    case LogStatus.LOADING:
      return {
        icon: <SpinnerIcon className="w-5 h-5 text-blue-400" />,
        textColor: 'text-blue-300',
      };
    case LogStatus.INFO:
    default:
      return {
        icon: <InfoIcon className="w-5 h-5 text-slate-400" />,
        textColor: 'text-slate-300',
      };
  }
};

const ProgressLog: React.FC<ProgressLogProps> = ({ messages }) => {
  const logContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  return (
    <div ref={logContainerRef} className="bg-slate-800 text-slate-200 font-mono text-sm p-4 rounded-md h-64 overflow-y-auto w-full shadow-inner">
      {messages.length === 0 ? (
        <div className="flex items-center text-slate-400">
          <span className="mr-2">&gt;</span> Waiting for campaign creation to start...
        </div>
      ) : (
        messages.map((msg, index) => {
          const { icon, textColor } = getStatusStyles(msg.status);
          return (
            <div key={index} className={`flex items-start mb-2 last:mb-0 ${textColor}`}>
              <div className="flex-shrink-0 mt-0.5 mr-3">{icon}</div>
              <div className="flex-grow">
                <p>{msg.text}</p>
                {msg.data && (
                   <pre className="mt-2 p-3 bg-slate-900 rounded-md text-xs text-slate-400 overflow-x-auto">
                     {JSON.stringify(msg.data, null, 2)}
                   </pre>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ProgressLog;
