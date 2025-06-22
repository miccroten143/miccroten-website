import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  LogOut,
  MessageSquare,
  Settings,
  User as UserIcon,
  Users,
  Clock,
  Moon,
  Sun
} from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface Message {
  id: number;
  name: string;
  email: string;
  phone: string;
  subject:string;               // please note here+++++++++++++++++++++++++++++++++++++++++++++++++++++++
  message: string;
  created_at: string;
  read: boolean;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout, isDarkMode, toggleDarkMode } = useAuthStore();
  const [timeoutWarning, setTimeoutWarning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMessages: 0,
    unreadMessages: 0
  });

  
  useEffect(() => {
    fetchStats();
    fetchMessages();

    const messagesSubscription = supabase
      .channel('messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        fetchMessages();
        fetchStats();
      })
      .subscribe();

    return () => {
      messagesSubscription.unsubscribe();
    };
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch all emails and remove duplicates in JavaScript
      const { data: messages, error: uniqueError } = await supabase
        .from('messages')
        .select('email')
        .neq('email', null);
  
      if (uniqueError) {
        console.error("Error fetching unique users:", uniqueError);
      }
  
      // Use Set to get unique emails
      const uniqueEmails = messages ? new Set(messages.map(msg => msg.email)) : new Set();
  
      // Get total messages count
      const { count: messageCount, error: messageError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });
  
      if (messageError) {
        console.error("Error fetching total messages:", messageError);
      }
  
      // Get unread messages count
      const { count: unreadCount, error: unreadError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('read', false);
  
      if (unreadError) {
        console.error("Error fetching unread messages:", unreadError);
      }
  
      // Update state
      setStats({
        totalUsers: uniqueEmails.size, // Get unique count from Set
        totalMessages: messageCount || 0,
        unreadMessages: unreadCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };
  

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: number) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);

      if (error) throw error;

      setMessages(messages.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      ));

      
      fetchStats();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const warningTimer = setTimeout(() => {
      setTimeoutWarning(true);
    }, 90000);

    timer = setTimeout(() => {
      logout();
      navigate('/login');
    }, 120000);

    return () => {
      clearTimeout(timer);
      clearTimeout(warningTimer);
    };
  }, [logout, navigate]);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers.toString(), icon: Users },
    { label: 'Total Messages', value: stats.totalMessages.toString(), icon: MessageSquare },
    { label: 'Unread Messages', value: stats.unreadMessages.toString(), icon: Bell },
  ];

  return (
    <div className={cn(
      "min-h-screen transition-all duration-200",
      isDarkMode ? "bg-gray-900" : "bg-gray-50"
    )}>
      {/* Header */}
      <header className={cn(
        "fixed top-0 left-0 right-0 backdrop-blur-lg border-b z-50 transition-colors duration-200",
        isDarkMode ? "bg-gray-900/80 border-gray-700" : "bg-white/80 border-gray-200"
       )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center"
            >
              <img src={isDarkMode ? "/Admin/assets/dark-mode-logo.png" : "/Admin/assets/light-mode-logo.png"} alt="" height={'95px'} width={'95px'} className='mt-2 '/>
              <span className={cn(
                "mr-2 text-xl font-bold transition-colors duration-200",
                isDarkMode ? "text-white" : "text-gray-900"
              )}>MICCROTEN Technologies Private Limited</span>
            </motion.div>

            <div className="flex items-center space-x-4 sm:ml-7">
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={toggleDarkMode}
                className={cn(
                  "p-2 rounded-full transition-colors",
                  isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                )}
              >
                {isDarkMode ? (
                  <Sun className="h-5 w-5 text-gray-300" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600" />
                )}
              </motion.button>

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={cn(
                  "hidden sm:p-2 rounded-full transition-colors",
                  isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                )}
              >
                <Settings className={cn(
                  "h-5 w-5",
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                )} />
              </motion.button>

              <div className="relative">
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    "hidden sm:flex items-center space-x-2 p-2 rounded-full transition-colors ",
                    isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
                  )}
                >
                  <UserIcon className={cn(
                    "h-5 w-5",
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  )} />
                  <span className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  )}>{user?.username}</span>
                </motion.button>
              </div>

              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-red-500"
              >
                <LogOut className="h-5 w-5" />
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-48 rounded-2xl overflow-hidden mb-8 bg-gradient-to-r from-gray-800 to-gray-500"
        >
          <img
            src="/Admin/assets/ADMIN-img.png"
            alt="Electronics Banner"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-1"
          />
          <div className="relative h-full flex items-center px-8">
            <h1 className="text-3xl font-bold text-white">Welcome back, Admin of MICCOTEN !</h1>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "rounded-xl p-6 shadow-sm hover:shadow-md transition-all",
                isDarkMode ? "bg-gray-800" : "bg-white border border-indigo-600 shadow-lg"
              )}
            >
              <div className="flex items-center">
                <div className="p-3 bg-grey-900 rounded-lg hover:bg-grey-600">
                  <stat.icon className="h-6 w-6 text-blue-600 " />
                </div>
                <div className="ml-4">
                  <p className={cn(
                    "text-sm font-medium",
                    isDarkMode ? "text-gray-200" : "text-gray-500"
                  )}>{stat.label}</p>
                  <p className={cn(
                    "text-2xl font-semibold",
                    isDarkMode ? "text-white" : "text-gray-900"
                  )}>{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Messages */}
        <div className={cn(
          "rounded-xl shadow-sm p-6 transition-colors duration-200",
          isDarkMode ? "bg-gray-800" : "bg-white border "
        )}>
          <div className="flex items-center justify-between mb-6">
            <h2 className={cn(
              "text-xl font-semibold",
              isDarkMode ? "text-white" : "text-gray-900 "
            )}>Recent Messages</h2>
            <input
              type="text"
              placeholder="Search messages..."
              className={cn(
                "px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-colors duration-200",
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-200 text-gray-900 placeholder-gray-500"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="relative">
                <div className={cn(
                  "w-16 h-16 rounded-full absolute animate-ping",
                  isDarkMode ? "bg-gray-700/50" : "bg-white/10 backdrop-blur-sm "
                )}></div>
                <Clock className="w-16 h-16 animate-spin text-brand-primary" />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages
                .filter(msg =>
                  msg.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  msg.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  msg.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "w-full rounded-lg p-4 transition-all cursor-pointer",
                      message.read
                        ? isDarkMode
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-white hover:bg-blue-20 border border-grey-900 shadow-lg"
                        : isDarkMode
                          ? "bg-green-600/20 hover:bg-green-700/40 border-l-4 border-green-900"
                          : "bg-blue-200/50 hover:bg-blue-300/70 border-l-4 border-blue-700"
                    )}
                    onClick={() => !message.read && markAsRead(message.id)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className={cn(
                          "font-medium",
                          isDarkMode ? "text-white" : "text-gray-900"
                        )}>Name : {message.name}</h3>
                        <p className={cn(
                          "text-sm",
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        )}>
                          {new Date(message.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!message.read && (
                        <span className="px-2 py-1 text-xs font-medium text-brand-primary bg-brand-primary/10 rounded-full">
                          New
                        </span>
                      )}
                    </div>
                    <h4 className={cn(
                      "text-md mb-2 font-bold ml-12",
                      isDarkMode ? "text-gray-100" : "text-gray-900"
                    )}>Subject : {message.subject}</h4>
                    <h5 className={cn(
                      "text-md mb-2 ml-12",
                      isDarkMode ? "text-gray-100" : "text-gray-800"
                    )}>Message : {message.message}</h5>
                    <div className={cn(
                      "text-sm",
                      isDarkMode ? "text-gray-200" : "text-gray-600"
                    )}>
                      <p>Email ID: {message.email}</p>
                      <p>Phone No. {message.phone}</p>
                    </div>
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      </main>

      {/* Timeout Warning */}
      {timeoutWarning && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "fixed bottom-4 right-4 border rounded-lg p-4 shadow-lg",
            isDarkMode
              ? "bg-green-900/50 border-yellow-700 text-yellow-200"
              : "bg-green-100 border-yellow-800 text-darkyellow-100"
          )}
        >
          <p className="text-sm">
            Due to High Security, your session will expire in 30 seconds.
          </p>
        </motion.div>
      )}
    </div>
  );
}