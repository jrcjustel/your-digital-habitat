import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, MessageChannel } from "@/types/lead";
import { Mail, Phone, MessageSquare, Send, Paperclip, Search, Filter, MoreHorizontal, Check, CheckCheck, Clock, Smartphone, Monitor, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface ImboxPanelProps { leadId?: string; className?: string }

const mockMessages: Message[] = [
  { id: '1', leadId: 'lead-1', channel: 'email', direction: 'inbound', subject: 'Consulta sobre piso en Salamanca', content: 'Hola, estoy interesado en el piso de 3 habitaciones en el barrio de Salamanca. ¿Podríamos coordinar una visita?', createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), readAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
  { id: '2', leadId: 'lead-1', channel: 'email', direction: 'outbound', subject: 'Re: Consulta sobre piso en Salamanca', content: 'Hola Ana, por supuesto. Tengo disponibilidad mañana por la tarde o el jueves por la mañana. ¿Cuál te viene mejor?', createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000), createdBy: 'agent-1' },
  { id: '3', leadId: 'lead-1', channel: 'whatsapp', direction: 'inbound', content: 'Perfecto! Me viene mejor mañana a las 17:00. ¿Es posible?', createdAt: new Date(Date.now() - 30 * 60 * 1000), readAt: new Date() }
];

const getChannelIcon = (channel: MessageChannel) => {
  const icons: Record<string, any> = { email: Mail, whatsapp: MessageSquare, phone: Phone, sms: Smartphone, web_chat: Monitor, facebook: Globe, instagram: Globe, idealista: Globe, fotocasa: Globe };
  const Icon = icons[channel] || Mail;
  return <Icon className="h-4 w-4" />;
};

const getChannelColor = (channel: MessageChannel) => {
  const colors: Record<string, string> = { email: 'bg-blue-500', whatsapp: 'bg-green-500', phone: 'bg-purple-500', sms: 'bg-yellow-500', web_chat: 'bg-indigo-500', facebook: 'bg-blue-600', instagram: 'bg-pink-500', idealista: 'bg-orange-500', fotocasa: 'bg-red-500' };
  return colors[channel] || 'bg-gray-500';
};

export const ImboxPanel = ({ leadId, className }: ImboxPanelProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<MessageChannel>('email');
  const [searchTerm, setSearchTerm] = useState('');

  const messages = leadId ? mockMessages.filter(m => m.leadId === leadId) : mockMessages;
  const filteredMessages = messages.filter(m => m.content.toLowerCase().includes(searchTerm.toLowerCase()) || (m.subject && m.subject.toLowerCase().includes(searchTerm.toLowerCase())));

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    console.log('Sending message:', { channel: selectedChannel, content: newMessage, leadId });
    setNewMessage('');
  };

  const channels: { value: MessageChannel; label: string }[] = [
    { value: 'email', label: 'Email' }, { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'phone', label: 'Llamada' }, { value: 'sms', label: 'SMS' }
  ];

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5" /> IMBOX
            <Badge variant="secondary" className="ml-2">{filteredMessages.filter(m => !m.readAt).length}</Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm"><Filter className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar mensajes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-4">
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <div key={message.id} className={cn("flex gap-3 p-3 rounded-lg border", message.direction === 'outbound' ? 'bg-primary/5' : 'bg-card', !message.readAt && message.direction === 'inbound' && 'ring-2 ring-blue-500/20')}>
                <div className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground", getChannelColor(message.channel))}>
                  {getChannelIcon(message.channel)}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{message.direction === 'inbound' ? 'Cliente' : 'Agente'}</span>
                      <Badge variant="outline" className="text-xs">{message.channel}</Badge>
                      {message.subject && <span className="text-sm text-muted-foreground">• {message.subject}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: es })}</span>
                      {message.direction === 'outbound' && (message.readAt ? <CheckCheck className="h-3 w-3 text-blue-500" /> : <Check className="h-3 w-3" />)}
                      {message.direction === 'inbound' && !message.readAt && <Clock className="h-3 w-3 text-orange-500" />}
                    </div>
                  </div>
                  <p className="text-sm">{message.content}</p>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex gap-2">{message.attachments.map((a) => <Badge key={a.id} variant="outline" className="text-xs"><Paperclip className="h-3 w-3 mr-1" />{a.name}</Badge>)}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-4 border-t space-y-3">
          <div className="flex gap-2">
            {channels.map((channel) => (
              <Button key={channel.value} variant={selectedChannel === channel.value ? "default" : "outline"} size="sm" onClick={() => setSelectedChannel(channel.value)} className="text-xs">
                {getChannelIcon(channel.value)}<span className="ml-1">{channel.label}</span>
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Textarea placeholder={`Escribir mensaje vía ${channels.find(c => c.value === selectedChannel)?.label}...`} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="min-h-[80px] resize-none" onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSendMessage(); }} />
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm"><Paperclip className="h-4 w-4" /></Button>
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()} size="sm"><Send className="h-4 w-4" /></Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Ctrl+Enter para enviar</p>
        </div>
      </CardContent>
    </Card>
  );
};
