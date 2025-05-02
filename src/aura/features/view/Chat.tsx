import React, {
    useState,
    useEffect,
    useRef,
    FormEvent,
    KeyboardEvent
} from 'react';
import { Conversation, MessageType } from './chat/types';
import { ChatSidebar }  from './chat/ChatSidebar';
import { ChatMessages } from './chat/ChatMessages';
import { ChatInput }    from './chat/ChatInput';
import { ChatInfo }     from './chat/ChatInfo';
import { ChatNotification, NotificationMode } from './chat/ChatNotification';
import { IconWrapper }  from './chat/IconWrapper';
import { FiHome, FiUsers, FiSettings, FiCheck } from 'react-icons/fi';

const notifLabels: Record<NotificationMode,string> = {
    off: 'Notificações desativadas',
    all: 'Notificar todas as mensagens',
    awaiting: 'Notificar somente aguardando'
};


interface ToastProps {
    visible: boolean;
    message: string;
    topOffset?: string;
}

const Toast: React.FC<ToastProps> = ({
    visible, message, topOffset = "1rem" }) => (
    <div
        style={{ top: topOffset }}
        className={`
      absolute left-1/2
      transform -translate-x-1/2
      bg-green-600 text-white px-6 py-3 rounded shadow-lg z-50
      flex items-center space-x-2
      transition-all duration-300 ease-out
      ${visible ? "opacity-100 scale-100" : "opacity-0 scale-90"}
    `}
    >
        <IconWrapper Icon={FiCheck} size={20} />
        <span>{message}</span>
    </div>
);

const Chat: React.FC = () => {
    const [convs, setConvs]               = useState<Conversation[]>([]);
    const [sel, setSel]                   = useState<string|null>(null);
    const [msgs, setMsgs]                 = useState<MessageType[]>([]);
    const [txt, setTxt]                   = useState('');
    const [filterView, setFilterView]     = useState<'ativo'|'aguardando'>('ativo');
    const [searchVisible, setSearchVisible] = useState(false);
    const [searchTerm, setSearchTerm]     = useState('');
    const [loadingMsgs, setLoadingMsgs]   = useState(false);
    const [showInfo, setShowInfo]         = useState(false);

    const [notifMode, setNotifMode]     = useState<NotificationMode>('off');
    const [unreadCount, setUnreadCount] = useState(0);
    const prevMsgIds = useRef<Set<string>>(new Set());

    const [toast, setToast] = useState<ToastProps>({ visible:false, message:'' });

    const THRESHOLD = 30_000; // 30s

    useEffect(() => {
        const load = () =>
            fetch('/api/conversations')
                .then(r => r.json())
                .then((data: Conversation[]) => setConvs(Array.isArray(data)? data : []))
                .catch(console.error);
        load();
        const iv = setInterval(load, 5000);
        return () => clearInterval(iv);
    }, []);

    useEffect(() => {
        if (!sel) {
            setMsgs([]);
            prevMsgIds.current.clear();
            return;
        }
        setLoadingMsgs(true);
        const loadMsgs = () =>
            fetch(`/api/conversations/${sel}/messages`)
                .then(r => r.json())
                .then((data: MessageType[]) => {
                    data.sort((a,b)=> new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                    setMsgs(data);
                })
                .catch(console.error)
                .finally(() => setLoadingMsgs(false));
        loadMsgs();
        const iv = setInterval(loadMsgs, 5000);
        return () => clearInterval(iv);
    }, [sel]);

    useEffect(() => {
        if (notifMode==='off') {
            prevMsgIds.current = new Set(msgs.map(m=>m.id));
            setUnreadCount(0);
            return;
        }
        const old = prevMsgIds.current;
        const news = msgs.filter(m=>!old.has(m.id) && m.sender!=='you');

        const now = Date.now();
        const selConv = convs.find(c=>c.id===sel);
        const isAwaiting = selConv?.lastAt
            ? now - new Date(selConv.lastAt).getTime() >= THRESHOLD
            : false;

        if (news.length > 0 && (notifMode==='all' || (notifMode==='awaiting' && isAwaiting))) {
            news.forEach(m => {
                new Audio('/notifications/message.wav').play().catch(()=>{});
                if (Notification.permission==='granted') {
                    new Notification(selConv?.title||'Nova Mensagem', {
                        body: m.text,
                        silent: true
                    });
                }
            });
            setUnreadCount(c=>c + news.length);
        }
        prevMsgIds.current = new Set(msgs.map(m=>m.id));
    }, [msgs, notifMode, sel, convs]);

    const handleNotifChange = (mode: NotificationMode) => {
        setNotifMode(mode);
        const contact = convs.find(c=>c.id===sel)?.title || 'Contato';
        setToast({ visible:true, message:`${notifLabels[mode]} para ${contact}` });
    };

    useEffect(() => {
        if (!toast.visible) return;
        const t = setTimeout(()=>setToast(t=>({...t,visible:false})), 3000);
        return ()=>clearTimeout(t);
    }, [toast.visible]);

    const handleSend = (e:FormEvent) => {
        e.preventDefault();
        if (!sel||!txt.trim()) return;
        fetch(`/api/conversations/${sel}/messages`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ sender:'you', text:txt.trim() })
        })
            .then(r=>r.json())
            .then((m:MessageType)=>m.id && setMsgs(ms=>[...ms,m]))
            .catch(console.error)
            .finally(()=>setTxt(''));
    };

    const handleSearchKey = (e:KeyboardEvent<HTMLInputElement>) => {
        if (e.key!=='Enter'||!sel||!searchTerm.trim()) return;
        e.preventDefault();
        fetch(`/api/conversations/${sel}/messages`, {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ sender:'you', text:searchTerm.trim() })
        })
            .then(r=>r.json())
            .then((m:MessageType)=>m.id && setMsgs(ms=>[...ms,m]))
            .catch(console.error)
            .finally(()=>setSearchTerm(''));
    };

    const nowVal = Date.now();
    const detailed = convs.map(c=>({
        ...c,
        timeAgo: c.lastAt? nowVal - new Date(c.lastAt).getTime() : Infinity
    }));
    const activeConvs   = detailed.filter(d=>d.timeAgo<THRESHOLD);
    const awaitingConvs = detailed.filter(d=>d.timeAgo>=THRESHOLD);

    let displayed = filterView==='ativo' ? activeConvs : awaitingConvs;
    if (searchVisible && searchTerm.trim()) {
        const t = searchTerm.toLowerCase();
        displayed = displayed.filter(c=>
            c.title.toLowerCase().includes(t) ||
            (c.lastMessage?.toLowerCase().includes(t) ?? false)
        );
    }

    const handleSelect = (id:string) => {
        setSel(id);
        setShowInfo(false);
    };

    return (
        <div className="flex h-screen font-sans">
            <nav
                className="w-16 flex flex-col items-center justify-between py-6"
                style={{ backgroundColor:'var(--sidebar-bg)' }}
            >
                <IconWrapper Icon={FiHome}  className="text-[var(--text-primary)] hover:scale-110 cursor-pointer"/>
                <IconWrapper Icon={FiUsers} className="text-[var(--text-primary)] hover:scale-110 cursor-pointer"/>
            </nav>

            <ChatSidebar
                activeConvs={activeConvs}
                awaitingConvs={awaitingConvs}
                sel={sel}
                filterView={filterView}
                onFilterChange={setFilterView}
                onSelect={handleSelect}
                searchVisible={searchVisible}
                searchTerm={searchTerm}
                onSearchToggle={()=>setSearchVisible(v=>!v)}
                onSearchChange={setSearchTerm}
                onSearchKey={handleSearchKey}
            />

            <main className="flex-1 flex flex-col relative">
                <div
                    className="flex items-center justify-between px-6 py-4 border-b"
                    style={{
                        backgroundColor:'var(--header-bg)',
                        borderColor:'var(--border-color)'
                    }}
                >
                    {sel ? (
                        <div className="flex items-center space-x-4">
                            <img
                                src="/avatars/contact.jpg"
                                alt="Contato"
                                className="w-12 h-12 rounded-full cursor-pointer"
                                onClick={()=>setShowInfo(true)}
                            />
                            <div>
                                <h3 className="font-semibold text-[var(--text-primary)]">
                                    {convs.find(c=>c.id===sel)?.title}
                                </h3>
                                <span className="text-green-400 text-sm">Active Now</span>
                            </div>
                        </div>
                    ) : (
                        <span className="text-[var(--text-muted)]">
              Selecione uma conversa
            </span>
                    )}

                    <div className="flex items-center space-x-4 relative">
                        <ChatNotification
                            mode={notifMode}
                            onChangeMode={handleNotifChange}
                            contactName={convs.find(c=>c.id===sel)?.title}
                        />
                        {unreadCount>0 && (
                            <span className="absolute -top-4 -right-6 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
                        )}
                        <IconWrapper
                            Icon={FiSettings}
                            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                        />
                    </div>
                </div>

                <ChatMessages msgs={msgs} loading={loadingMsgs}/>
                <ChatInput text={txt} onChange={setTxt} onSend={handleSend}/>

                <Toast visible={toast.visible} message={toast.message}/>
            </main>

            {showInfo && sel && (
                <ChatInfo
                    conv={convs.find(c=>c.id===sel)!}
                    messages={msgs}
                    onClose={()=>setShowInfo(false)}
                />
            )}
        </div>
    );
};

export default Chat;