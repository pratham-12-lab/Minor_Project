import React from 'react';
import { useSocket } from '@/hooks/useSocket';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const SocketIndicator = ({ className }) => {
  const { isConnected, isReconnecting, error } = useSocket();

  const getStatus = () => {
    if (isReconnecting) {
      return {
        icon: RefreshCw,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-50',
        pulse: 'animate-spin',
        tooltip: 'Reconnecting...',
        show: true
      };
    }
    
    if (!isConnected || error) {
      return {
        icon: WifiOff,
        color: 'text-red-500',
        bgColor: 'bg-red-50',
        pulse: 'animate-pulse',
        tooltip: 'Connection lost - Some features may not work',
        show: true
      };
    }
    
    return {
      icon: Wifi,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      pulse: '',
      tooltip: 'Connected - All features available',
      show: false // Hide when connected normally
    };
  };

  const status = getStatus();
  const Icon = status.icon;

  // Don't show indicator when everything is working normally
  if (!status.show) return null;

  return (
    <div 
      className={cn(
        'relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300',
        status.bgColor,
        className
      )}
      title={status.tooltip}
    >
      <Icon 
        size={16} 
        className={cn(
          status.color,
          status.pulse,
          'transition-all duration-300'
        )} 
      />
      
      {/* Pulse ring for reconnecting */}
      {isReconnecting && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75 animate-ping"></span>
      )}
      
      {/* Error indicator */}
      {error && (
        <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping"></span>
      )}
    </div>
  );
};

export default SocketIndicator;