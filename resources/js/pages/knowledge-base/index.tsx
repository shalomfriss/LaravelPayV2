import { Head, usePage } from '@inertiajs/react';
import {
    Brain,
    Send,
    UploadCloud,
    FileText,
    Settings,
    Search,
    MessageSquare,
    Database,
    Sparkles,
    CheckCircle2,
    Trash2,
    Cpu,
    ExternalLink
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Team = {
    id: number;
    name: string;
    slug: string;
};

type Props = {
    team: Team;
};

interface Message {
    id: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp: Date;
    citations?: string[];
}

interface IngestedDocument {
    id: string;
    name: string;
    size: string;
    chunks: number;
    uploadedAt: string;
    status: 'ready' | 'processing';
}

export default function KnowledgeBaseIndex({ team }: Props) {
    const page = usePage();
    const [activeTab, setActiveTab] = useState<'chat' | 'docs' | 'settings'>('chat');
    
    // Chat State
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            sender: 'ai',
            text: `Hello! I am your OpenRag AI assistant. I have access to all documents ingested into the **${team.name}** knowledge base. Ask me anything about your documents.`,
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Documents State
    const [documents, setDocuments] = useState<IngestedDocument[]>([
        {
            id: 'doc-1',
            name: 'machine-learning-cheat-sheet.pdf',
            size: '1.2 MB',
            chunks: 24,
            uploadedAt: '2026-06-06',
            status: 'ready',
        },
        {
            id: 'doc-2',
            name: 'employee-handbook.pdf',
            size: '3.4 MB',
            chunks: 112,
            uploadedAt: '2026-06-05',
            status: 'ready',
        },
        {
            id: 'doc-3',
            name: 'security-guidelines.docx',
            size: '512 KB',
            chunks: 18,
            uploadedAt: '2026-06-05',
            status: 'ready',
        }
    ]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Settings State
    const [settings, setSettings] = useState({
        apiUrl: 'http://localhost:8000/api/v1/openrag',
        apiKey: 'sk-openrag-m78x9w2n8k4l1j9p',
        chunkSize: 500,
        chunkOverlap: 50,
        model: 'Llama-3-8B-Instruct',
        vectorDb: 'ChromaDB'
    });

    const filteredDocs = documents.filter(doc => 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI RAG response
        setTimeout(() => {
            let aiText = "I couldn't find any specific information in your ingested documents to answer that. Could you try rephrasing or uploading more documents?";
            let citations: string[] = [];

            const textLower = userMsg.text.toLowerCase();
            if (textLower.includes('machine learning') || textLower.includes('cheat sheet') || textLower.includes('ml')) {
                aiText = "Based on the **machine-learning-cheat-sheet.pdf**, machine learning can be supervised (regression, classification) or unsupervised (clustering, association). Deep learning utilizes multi-layered neural networks for representations.";
                citations = ['machine-learning-cheat-sheet.pdf (Page 2)'];
            } else if (textLower.includes('handbook') || textLower.includes('remote') || textLower.includes('work')) {
                aiText = "According to the **employee-handbook.pdf**, the team's remote work policy allows core working hours between 9 AM and 3 PM EST. All members are expected to be online and reachable on Slack during this window.";
                citations = ['employee-handbook.pdf (Section 4.2)'];
            } else if (textLower.includes('security') || textLower.includes('password') || textLower.includes('guidelines')) {
                aiText = "The **security-guidelines.docx** document states that all employee passwords must have a minimum length of 12 characters, including at least one uppercase letter, one number, and one special character.";
                citations = ['security-guidelines.docx (Page 1)'];
            }

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: aiText,
                timestamp: new Date(),
                citations: citations.length > 0 ? citations : undefined
            };

            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, 1500);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        
        setIsUploading(true);
        setUploadProgress(10);

        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 90) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 20;
            });
        }, 200);

        setTimeout(() => {
            const newDoc: IngestedDocument = {
                id: `doc-${Date.now()}`,
                name: file.name,
                size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
                chunks: Math.floor(Math.random() * 40) + 10,
                uploadedAt: new Date().toISOString().split('T')[0],
                status: 'ready'
            };

            setDocuments(prev => [newDoc, ...prev]);
            setIsUploading(false);
            setUploadProgress(0);
        }, 1200);
    };

    const handleDeleteDoc = (id: string) => {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
    };

    return (
        <>
            <Head title="OpenRag Knowledge Base" />

            <div className="flex flex-col space-y-6 p-1 md:p-4">
                {/* Header Banner */}
                <div className="relative overflow-hidden rounded-2xl border bg-linear-to-r from-violet-600/10 via-indigo-600/5 to-transparent p-6 shadow-xs">
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-indigo-500 animate-pulse" />
                                <h1 className="text-2xl font-bold tracking-tight">OpenRag Knowledge Base</h1>
                            </div>
                            <p className="text-sm text-muted-foreground max-w-xl">
                                Retrieval-Augmented Generation (RAG) platform. Import files, search document chunks, and chat interactively with your local team knowledge.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-semibold text-green-600 dark:text-green-400">
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                                RAG Server: Online
                            </div>
                            <a 
                                href="https://github.com/langflow-ai/openrag/" 
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-1 text-xs text-indigo-500 hover:underline"
                            >
                                OpenRag Docs <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Main Section */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left Navigation Menu */}
                    <div className="lg:col-span-1 flex flex-col space-y-2">
                        <Button
                            variant={activeTab === 'chat' ? 'default' : 'ghost'}
                            className="justify-start gap-2 h-11"
                            onClick={() => setActiveTab('chat')}
                        >
                            <MessageSquare className="h-4 w-4" />
                            Chat with Knowledge
                        </Button>
                        <Button
                            variant={activeTab === 'docs' ? 'default' : 'ghost'}
                            className="justify-start gap-2 h-11"
                            onClick={() => setActiveTab('docs')}
                        >
                            <FileText className="h-4 w-4" />
                            Document Library
                        </Button>
                        <Button
                            variant={activeTab === 'settings' ? 'default' : 'ghost'}
                            className="justify-start gap-2 h-11"
                            onClick={() => setActiveTab('settings')}
                        >
                            <Settings className="h-4 w-4" />
                            OpenRag Settings
                        </Button>

                        {/* OpenRag System Info Card */}
                        <div className="mt-4 rounded-xl border bg-card p-4 space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">OpenRag Engine</h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Model:</span>
                                    <span className="font-semibold">{settings.model}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Vector Store:</span>
                                    <span className="font-semibold">{settings.vectorDb}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Chunk Size:</span>
                                    <span className="font-semibold">{settings.chunkSize} chars</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Documents:</span>
                                    <span className="font-semibold">{documents.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 min-h-[500px]">
                        {activeTab === 'chat' && (
                            <div className="flex flex-col h-full rounded-2xl border bg-card/50 overflow-hidden min-h-[550px] shadow-sm">
                                {/* Chat Messages Window */}
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[450px]">
                                    {messages.map(msg => (
                                        <div 
                                            key={msg.id} 
                                            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[85%] rounded-2xl p-4 shadow-xs ${
                                                msg.sender === 'user' 
                                                    ? 'bg-indigo-600 text-white rounded-br-none' 
                                                    : 'bg-background border rounded-bl-none'
                                            }`}>
                                                <div className="text-sm leading-relaxed">{msg.text}</div>
                                                {msg.citations && (
                                                    <div className="mt-2 pt-2 border-t border-muted/20 text-xs flex flex-wrap gap-1.5 items-center">
                                                        <span className="font-semibold text-muted-foreground">Sources:</span>
                                                        {msg.citations.map((cit, idx) => (
                                                            <span key={idx} className="bg-muted px-2 py-0.5 rounded text-indigo-500 font-medium">
                                                                {cit}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className={`text-[10px] mt-1 text-right ${
                                                    msg.sender === 'user' ? 'text-indigo-200' : 'text-muted-foreground'
                                                }`}>
                                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {isTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-background border rounded-2xl rounded-bl-none p-4 shadow-xs max-w-[80%] flex items-center gap-2">
                                                <Brain className="h-4 w-4 text-indigo-500 animate-bounce" />
                                                <span className="text-sm text-muted-foreground">OpenRag is fetching context & generating response...</span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Chat Bottom Input bar */}
                                <form onSubmit={handleSendMessage} className="p-3 border-t bg-background/50 flex gap-2 items-center">
                                    <Input
                                        placeholder="Ask a question about your documents..."
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        className="flex-1 focus-visible:ring-indigo-500"
                                    />
                                    <Button type="submit" size="icon" className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </form>
                            </div>
                        )}

                        {activeTab === 'docs' && (
                            <div className="space-y-6">
                                {/* Drag & Drop Document Ingester Zone */}
                                <div className="border-2 border-dashed rounded-2xl p-8 text-center bg-card/20 hover:bg-card/40 transition-colors relative">
                                    <input 
                                        type="file" 
                                        id="rag-file-upload" 
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                    />
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <div className="p-3 bg-indigo-500/10 rounded-full text-indigo-500">
                                            <UploadCloud className="h-8 w-8" />
                                        </div>
                                        <div className="font-semibold text-sm">Drag & drop files here, or click to browse</div>
                                        <div className="text-xs text-muted-foreground">Supports PDF, DOCX, TXT, MD, HTML (Max 20MB)</div>
                                    </div>

                                    {isUploading && (
                                        <div className="mt-4 max-w-xs mx-auto space-y-2">
                                            <div className="flex justify-between text-xs">
                                                <span className="font-medium text-indigo-500">Ingesting & Indexing chunks...</span>
                                                <span>{uploadProgress}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-indigo-600 transition-all duration-300" 
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Document Directory List */}
                                <div className="rounded-2xl border bg-card p-4 space-y-4">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                                        <h2 className="text-base font-bold flex items-center gap-1.5">
                                            <Database className="h-4 w-4 text-indigo-500" />
                                            Document Directory
                                        </h2>
                                        <div className="relative max-w-xs w-full">
                                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search ingested files..."
                                                value={searchQuery}
                                                onChange={e => setSearchQuery(e.target.value)}
                                                className="pl-9"
                                            />
                                        </div>
                                    </div>

                                    <div className="divide-y">
                                        {filteredDocs.map(doc => (
                                            <div key={doc.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                                                        <FileText className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold">{doc.name}</div>
                                                        <div className="text-xs text-muted-foreground flex gap-3">
                                                            <span>Size: {doc.size}</span>
                                                            <span>•</span>
                                                            <span>Chunks: {doc.chunks}</span>
                                                            <span>•</span>
                                                            <span>Uploaded: {doc.uploadedAt}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        Indexed
                                                    </span>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                        onClick={() => handleDeleteDoc(doc.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                        {filteredDocs.length === 0 && (
                                            <div className="text-center py-8 text-muted-foreground text-sm">
                                                No documents found in the database.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="rounded-2xl border bg-card p-6 space-y-6">
                                <div className="space-y-1">
                                    <h2 className="text-base font-bold flex items-center gap-1.5">
                                        <Cpu className="h-4 w-4 text-indigo-500" />
                                        OpenRag Configurations
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Configure parameters for the RAG engine server and embedding pipeline.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="apiUrl">API Server Endpoint</Label>
                                        <Input 
                                            id="apiUrl" 
                                            value={settings.apiUrl}
                                            onChange={e => setSettings(prev => ({ ...prev, apiUrl: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="apiKey">OpenRag Secret Key</Label>
                                        <Input 
                                            id="apiKey" 
                                            type="password"
                                            value={settings.apiKey}
                                            onChange={e => setSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="chunkSize">Chunk Token Size (characters)</Label>
                                        <Input 
                                            id="chunkSize" 
                                            type="number"
                                            value={settings.chunkSize}
                                            onChange={e => setSettings(prev => ({ ...prev, chunkSize: parseInt(e.target.value) || 0 }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="chunkOverlap">Chunk Overlap (characters)</Label>
                                        <Input 
                                            id="chunkOverlap" 
                                            type="number"
                                            value={settings.chunkOverlap}
                                            onChange={e => setSettings(prev => ({ ...prev, chunkOverlap: parseInt(e.target.value) || 0 }))}
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t">
                                    <Button 
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                        onClick={() => alert('OpenRag settings updated successfully!')}
                                    >
                                        Save Configuration
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

KnowledgeBaseIndex.layout = (props: { team: Team }) => ({
    breadcrumbs: [
        {
            title: 'Knowledge Base',
            href: `/${props.team.slug}/knowledge-base`,
        },
    ],
});
