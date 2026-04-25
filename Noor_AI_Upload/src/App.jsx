import React, { useState, useEffect, useRef } from 'react';
import { auth, provider, db } from './lib/firebase';
import { signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { allDuas } from './data/duas';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

        // --- Icons ---
        const IconHome = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
        const IconBook = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
        const IconMessage = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>;
        const IconSettings = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
        const IconMic = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>;
        const IconMoon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>;
        const IconSun = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>;
        const IconScroll = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M3 15h6"/><path d="M3 19h6"/><path d="M13 14h6"/></svg>;
        const IconLogout = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>;
        const IconHeart = ({ solid }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={solid ? "#ef4444" : "none"} stroke={solid ? "#ef4444" : "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>;

        // --- Components ---
        
        const Sidebar = ({ activeTab, setActiveTab, toggleDarkMode, isDarkMode, onLogout }) => {
            const menuItems = [
                { id: 'dashboard', name: 'Dashboard', icon: <IconHome /> },
                { id: 'quran', name: 'Quran', icon: <IconBook /> },
                { id: 'hadith', name: 'Sunnahs Duas Hadiths', icon: <IconScroll /> },
                { id: 'buddy', name: 'Noor Buddy', icon: <IconMessage /> },
            ];

            return (
                <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 shadow-sm h-screen fixed left-0 top-0 flex flex-col transition-colors duration-300">
                    <div className="p-6 flex items-center space-x-3">
                        <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand/30">
                            N
                        </div>
                        <h1 className="text-2xl font-bold text-brand dark:text-brand-accent">Noor AI</h1>
                    </div>
                    
                    <div className="flex-1 px-4 space-y-2 mt-4">
                        {menuItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                    activeTab === item.id 
                                        ? 'bg-brand-light dark:bg-brand/20 text-brand dark:text-brand-accent font-semibold shadow-sm' 
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-brand dark:hover:text-brand-accent'
                                }`}
                            >
                                <div className={`${activeTab === item.id ? 'text-brand dark:text-brand-accent' : 'text-gray-400'}`}>
                                    {item.icon}
                                </div>
                                <span>{item.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="p-4 space-y-2">
                        <button 
                            onClick={toggleDarkMode}
                            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-all duration-200"
                        >
                            {isDarkMode ? <IconSun /> : <IconMoon />}
                            <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                    </div>
                </div>
            );
        };

        const Topbar = ({ user, streak, onShowTour, onLogout }) => {
            const displayName = user ? user.displayName?.split(' ')[0] : 'Guest';
            const photoURL = user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}&backgroundColor=e6f4ea`;
            const [isProfileOpen, setIsProfileOpen] = useState(false);

            return (
                <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm transition-colors duration-300">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Assalamu Alaikum, {displayName}! 👋</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Welcome to your daily Deen dashboard.</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button onClick={onShowTour} className="hidden md:flex bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-full text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-transparent dark:border-gray-600 shadow-sm">
                            Test Tour
                        </button>
                        <div className="bg-brand-light dark:bg-brand/20 px-4 py-2 rounded-full text-sm font-medium text-brand dark:text-brand-accent border border-brand/20">
                            🔥 {streak} Day Streak
                        </div>
                        <div className="relative">
                            <button 
                                onClick={() => setIsProfileOpen(!isProfileOpen)} 
                                className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 shadow-sm overflow-hidden flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-brand"
                            >
                                <img src={photoURL} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </button>
                            
                            {isProfileOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-2 z-20">
                                        <button 
                                            onClick={() => { setIsProfileOpen(false); onLogout(); }}
                                            className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-medium flex items-center space-x-2"
                                        >
                                            <IconLogout />
                                            <span>Sign Out</span>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </header>
            );
        };

        const DashboardCard = ({ title, description, icon, primaryColor, actionText, onClick }) => {
            return (
                <div onClick={onClick} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group cursor-pointer">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-brand/5 dark:to-brand/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm`} style={{ backgroundColor: primaryColor + '20', color: primaryColor }}>
                        {icon}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 min-h-[40px]">{description}</p>
                    
                    <button className="w-full py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5" style={{ backgroundColor: primaryColor }}>
                        <span>{actionText}</span>
                    </button>
                </div>
            );
        };

        const MainContent = ({ setActiveTab }) => {
            return (
                <div className="p-8 max-w-6xl mx-auto">
                    {/* Hero Banner */}
                    <div className="bg-gradient-to-r from-brand to-brand-accent rounded-3xl p-8 text-white shadow-xl shadow-brand/20 mb-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 opacity-10">
                            <svg width="300" height="300" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="2" strokeDasharray="5 5"/>
                                <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="2"/>
                                <path d="M50 10 L50 90 M10 50 L90 50" stroke="white" strokeWidth="2"/>
                            </svg>
                        </div>
                        
                        <div className="relative z-10 max-w-lg">
                            <h2 className="text-3xl font-bold mb-3">Continue Hifz</h2>
                            <p className="text-brand-light mb-6">Your voice recognition model is ready to listen to your recitation.</p>
                            <button onClick={() => setActiveTab('quran')} className="bg-white text-brand px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-gray-50 transition-colors shadow-md">
                                <IconMic />
                                <span>Start Reading</span>
                            </button>
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Your Tools</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <DashboardCard 
                            onClick={() => setActiveTab('quran')}
                            title="Quran" 
                            description="Read the Quran or test your Hifz memory."
                            icon={<IconBook />}
                            primaryColor="#00603A"
                            actionText="Open Quran"
                        />
                        <DashboardCard 
                            onClick={() => setActiveTab('hadith')}
                            title="Sunnah Reading" 
                            description="Read authentic Hadiths and Duas categorized by daily life."
                            icon={<IconScroll />}
                            primaryColor="#0ea5e9"
                            actionText="Open Hadiths"
                        />
                        <DashboardCard 
                            onClick={() => setActiveTab('buddy')}
                            title="Noor Buddy" 
                            description="Ask questions and search the Quran."
                            icon={<IconMessage />}
                            primaryColor="#10b981"
                            actionText="Start Chatting"
                        />
                    </div>
                </div>
            );
        };

        // Bismillah
        const HifzMode = () => {
            const [surahs, setSurahs] = useState([]);
            const [selectedSurah, setSelectedSurah] = useState(1);
            const [ayahs, setAyahs] = useState([]);
            const [isLoading, setIsLoading] = useState(true);
            
            const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
            const [status, setStatus] = useState('idle'); // 'idle', 'listening', 'checking', 'result', 'empty'
            const [feedbackData, setFeedbackData] = useState(null);
            const [transcript, setTranscript] = useState('');

            const recognitionRef = useRef(null);

            useEffect(() => {
                fetch('https://api.quran.com/api/v4/chapters?language=en')
                    .then(res => res.json())
                    .then(data => {
                        setSurahs(data.chapters);
                        loadSurahAyahs(1); 
                    });
                return () => stopListening();
            }, []);

            const loadSurahAyahs = (surahId) => {
                setIsLoading(true);
                stopListening();
                fetch(`https://api.quran.com/api/v3/chapters/${surahId}/verses?language=en&per_page=300`)
                    .then(res => res.json())
                    .then(data => {
                        setAyahs(data.verses);
                        setCurrentAyahIndex(0);
                        setFeedbackData(null);
                        setTranscript('');
                        setIsLoading(false);
                    });
            };

            const handleSurahChange = (e) => {
                const id = parseInt(e.target.value);
                setSelectedSurah(id);
                loadSurahAyahs(id);
            };

            const stopListening = () => {
                if (recognitionRef.current) {
                    recognitionRef.current.stop();
                    recognitionRef.current = null;
                }
            };

            const toggleListening = () => {
                if (status === 'listening') {
                    // Check instantly without waiting for the browser's slow onend event
                    checkHifz(transcript);
                    stopListening();
                } else {
                    startListening();
                }
            };

            const startListening = () => {
                setTranscript('');
                setFeedbackData(null);
                
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                if (!SpeechRecognition) {
                    alert("Your browser doesn't support the Web Speech API. Please use Google Chrome.");
                    return;
                }

                const recognition = new SpeechRecognition();
                recognitionRef.current = recognition;
                recognition.lang = 'ar-SA';
                recognition.continuous = true;
                recognition.interimResults = true;

                let finalTranscript = '';

                recognition.onstart = () => setStatus('listening');
                
                recognition.onresult = (event) => {
                    let currentTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        currentTranscript += event.results[i][0].transcript + ' ';
                    }
                    finalTranscript = currentTranscript.trim();
                    setTranscript(finalTranscript);
                };

                recognition.onerror = () => {
                    setStatus('idle');
                    alert("Microphone error. Please try again.");
                };
                
                recognition.onend = () => {
                    if (status === 'listening' || status === 'checking') {
                        checkHifz(finalTranscript);
                    }
                };
                
                recognition.start();
            };

            const getChunkEndIndex = () => {
                if (!ayahs || ayahs.length === 0) return 0;
                
                let currentWordCount = 0;
                let endIndex = currentAyahIndex;
                const MAX_WORDS_PER_CHUNK = 30; // Target ~30 words per test
                
                while (endIndex < ayahs.length) {
                    const text = ayahs[endIndex].text_madani || ayahs[endIndex].text_uthmani || "";
                    const words = text.split(' ').filter(w => w.length > 0).length;
                    currentWordCount += words;
                    
                    if (currentWordCount >= MAX_WORDS_PER_CHUNK || endIndex === ayahs.length - 1) {
                        break;
                    }
                    endIndex++;
                }
                
                return endIndex;
            };
            const chunkEndIndex = getChunkEndIndex();

            const checkHifz = async (finalTranscript) => {
                if (!finalTranscript) {
                    setStatus('empty');
                    return;
                }
                
                setStatus('checking');
                const targetText = ayahs.slice(currentAyahIndex, chunkEndIndex + 1)
                                        .map(a => a.text_madani || a.text_uthmani)
                                        .join(' ');
                
                try {
                    const res = await fetch(`${API_BASE_URL}/api/hifz-check`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ targetText, transcript: finalTranscript })
                    });
                    
                    const data = await res.json();
                    setFeedbackData(data);
                    setStatus('result');
                } catch (err) {
                    console.error("AI Evaluation error:", err);
                    setFeedbackData({
                        isCorrect: false,
                        feedback: err.message || "Backend error. Please ensure the Express server is running on port 5000 and has a valid GEMINI_API_KEY.",
                        wrongWord: err.message ? "Error" : "Server Error"
                    });
                    setStatus('result');
                }
            };

            const nextAyah = () => {
                if (chunkEndIndex < ayahs.length - 1) {
                    setCurrentAyahIndex(chunkEndIndex + 1);
                    setStatus('idle');
                    setFeedbackData(null);
                    setTranscript('');
                }
            };

            const tryAgain = () => {
                setStatus('idle');
                setFeedbackData(null);
                setTranscript('');
                startListening();
            };

            return (
                <div className="flex-1 flex flex-col p-8 bg-white dark:bg-gray-800 m-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 h-[calc(100vh-120px)]">
                    <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">AI Hifz Checker</h2>
                            <p className="text-gray-500 dark:text-gray-400">Recite an Ayah, and Noor Buddy will catch any mistakes.</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <select 
                                value={selectedSurah} 
                                onChange={handleSurahChange}
                                className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-white focus:outline-none focus:border-brand font-medium max-w-[200px]"
                            >
                                {surahs.map(s => <option key={s.id} value={s.id}>{s.id}. {s.name_simple}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    {isLoading ? (
                        <div className="flex-1 flex justify-center items-center text-gray-500 dark:text-gray-400">Loading Surah...</div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto p-4 space-y-8">
                            <div className="text-lg text-gray-500 dark:text-gray-400 mb-4 font-medium bg-gray-100 dark:bg-gray-700 px-6 py-2 rounded-full">
                                {currentAyahIndex === chunkEndIndex ? `Ayah ${currentAyahIndex + 1}` : `Ayahs ${currentAyahIndex + 1} to ${chunkEndIndex + 1}`} of {ayahs.length}
                            </div>
                            
                            <div className={`max-w-4xl w-full p-10 rounded-3xl border-2 transition-all duration-500 min-h-[200px] flex items-center justify-center flex-col shadow-inner
                                ${status === 'result' && feedbackData?.isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 
                                  status === 'result' && !feedbackData?.isCorrect ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 
                                  status === 'checking' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 animate-pulse' :
                                  status === 'listening' ? 'bg-brand-light/30 dark:bg-brand/10 border-brand/30 ring-4 ring-brand/10' :
                                  status === 'empty' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' :
                                  'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'}`}
                            >
                                {status === 'idle' || status === 'listening' || status === 'checking' || status === 'empty' ? (
                                    <div className="text-4xl text-gray-400 dark:text-gray-600 select-none blur-sm transition-all duration-300 leading-[4rem] text-right" dir="rtl" style={{ fontFamily: 'Amiri, serif' }}>
                                        {ayahs.slice(currentAyahIndex, chunkEndIndex + 1).map((a, i) => (
                                            <span key={i}>
                                                {a.text_madani} <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-400 text-sm mx-2 select-none">{a.verse_number}</span>
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-4xl leading-[4rem] text-right" dir="rtl" style={{ fontFamily: 'Amiri, serif' }}>
                                        {ayahs.slice(currentAyahIndex, chunkEndIndex + 1).map((a, ayahIdx) => (
                                            <span key={ayahIdx}>
                                                {a.text_madani.split(' ').map((word, i) => {
                                                    const isWrong = !feedbackData.isCorrect && feedbackData.wrongWord && word.includes(feedbackData.wrongWord);
                                                    return (
                                                        <span key={`${ayahIdx}-${i}`} className={`mx-2 inline-block transition-colors duration-500 ${isWrong ? 'text-red-500 font-bold border-b-4 border-red-500 pb-1 scale-110' : (feedbackData.isCorrect ? 'text-green-600 dark:text-green-400' : 'text-gray-800 dark:text-gray-100')}`}>
                                                            {word}
                                                        </span>
                                                    );
                                                })}
                                                <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full border text-sm mx-2 select-none ${feedbackData.isCorrect ? 'border-green-400 text-green-600 dark:text-green-400' : 'border-gray-400 text-gray-500'}`}>{a.verse_number}</span>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                
                                {status === 'listening' && (
                                    <div className="mt-8 text-2xl text-brand font-medium animate-pulse text-center" dir="rtl" style={{ fontFamily: 'Amiri, serif' }}>
                                        {transcript || "..."}
                                    </div>
                                )}
                                
                                {status === 'checking' && (
                                    <div className="mt-8 text-xl text-blue-500 font-medium flex items-center space-x-3">
                                        <svg className="animate-spin h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        <span>Noor Buddy is analyzing your recitation...</span>
                                    </div>
                                )}
                                {status === 'empty' && (
                                    <div className="mt-8 text-xl text-orange-500 font-medium text-center">
                                        I didn't catch that. Please make sure your microphone is working and speak clearly.
                                    </div>
                                )}
                            </div>

                            {status === 'result' && (
                                <div className={`max-w-2xl w-full p-6 rounded-2xl shadow-sm text-center animate-in fade-in slide-in-from-bottom-4 duration-500 ${feedbackData.isCorrect ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'}`}>
                                    <h3 className="text-2xl font-bold mb-2">
                                        {feedbackData.isCorrect ? '✨ Perfect, MashaAllah!' : 'Correction'}
                                    </h3>
                                    <p className="text-lg opacity-90">{feedbackData.feedback}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-center space-x-4">
                        {(status === 'idle' || status === 'listening' || status === 'empty') && (
                            <button 
                                onClick={toggleListening}
                                className={`px-10 py-4 rounded-full font-bold text-lg text-white shadow-md transition-all duration-300 flex items-center space-x-3 ${
                                    status === 'listening' ? 'bg-red-500 animate-pulse scale-105 shadow-red-500/30 ring-4 ring-red-500/20' : 'bg-brand hover:bg-brand-dark hover:-translate-y-1 hover:shadow-lg hover:shadow-brand/30'
                                }`}
                            >
                                <IconMic />
                                <span>{status === 'listening' ? "Stop Recording" : "Start Reciting"}</span>
                            </button>
                        )}
                        
                        {status === 'result' && (
                            <>
                                {!feedbackData?.isCorrect && (
                                    <button 
                                        onClick={tryAgain}
                                        className="px-8 py-4 rounded-full font-bold text-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2 shadow-sm"
                                    >
                                        <span>Try Again</span>
                                    </button>
                                )}
                                <button 
                                    onClick={nextAyah}
                                    className="px-8 py-4 rounded-full font-bold text-lg bg-brand text-white shadow-md hover:bg-brand-dark hover:-translate-y-1 transition-all flex items-center space-x-2"
                                >
                                    <span>{feedbackData?.isCorrect ? "Next Ayah" : "Skip Ayah"}</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            );
        };

        const QuranHub = ({ setActiveTab }) => {
            return (
                <div className="p-8 max-w-6xl mx-auto flex flex-col items-center justify-center h-[calc(100vh-120px)] space-y-8">
                    <h2 className="text-4xl font-bold text-gray-800 dark:text-gray-100">Quran Hub</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-lg text-center max-w-2xl">
                        Choose how you want to interact with the Holy Quran today.
                    </p>
                    <div className="flex space-x-6">
                        <div onClick={() => setActiveTab('quran-reading')} className="w-64 bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center group">
                            <div className="w-20 h-20 bg-[#0ea5e9] bg-opacity-20 rounded-full flex items-center justify-center text-[#0ea5e9] mb-6 group-hover:scale-110 transition-transform">
                                <IconBook />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 dark:text-white">Reading</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Read full pages with audio recitation and translation.</p>
                        </div>
                        <div onClick={() => setActiveTab('quran-hifz')} className="w-64 bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center group">
                            <div className="w-20 h-20 bg-brand bg-opacity-20 rounded-full flex items-center justify-center text-brand mb-6 group-hover:scale-110 transition-transform">
                                <IconMic />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 dark:text-white">Hifz</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Test your memorization word-by-word without audio.</p>
                        </div>
                    </div>
                </div>
            );
        };

        const ReadingMode = () => {
            const [surahs, setSurahs] = useState([]);
            const [selectedSurah, setSelectedSurah] = useState(1);
            const [ayahs, setAyahs] = useState([]);
            const [isLoading, setIsLoading] = useState(true);
            const [reciter, setReciter] = useState(7);
            const [gap, setGap] = useState(0);
            const [isPlaying, setIsPlaying] = useState(false);
            const [currentPlayingIndex, setCurrentPlayingIndex] = useState(-1);
            
            const audioRef = useRef(null);
            const timeoutRef = useRef(null);
            const isPlayingRef = useRef(false);

            useEffect(() => {
                fetch('https://api.quran.com/api/v4/chapters?language=en')
                    .then(res => res.json())
                    .then(data => {
                        setSurahs(data.chapters);
                        loadSurahAyahs(1, 7); 
                    });
                return () => stopAudio();
            }, []);

            const loadSurahAyahs = (surahId, reciterId) => {
                setIsLoading(true);
                stopAudio();
                fetch(`https://api.quran.com/api/v3/chapters/${surahId}/verses?translations=131&language=en&recitation=${reciterId}&per_page=300`)
                    .then(res => res.json())
                    .then(data => {
                        setAyahs(data.verses);
                        setIsLoading(false);
                    });
            };

            const handleSurahChange = (e) => {
                const id = parseInt(e.target.value);
                setSelectedSurah(id);
                loadSurahAyahs(id, reciter);
            };

            const handleReciterChange = (e) => {
                const id = parseInt(e.target.value);
                setReciter(id);
                loadSurahAyahs(selectedSurah, id);
            };

            const stopAudio = () => {
                setIsPlaying(false);
                isPlayingRef.current = false;
                setCurrentPlayingIndex(-1);
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.src = "";
                    audioRef.current = null;
                }
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            };

            const playAudioSequence = (startIndex = 0) => {
                if (startIndex >= ayahs.length) {
                    stopAudio();
                    return;
                }
                
                setIsPlaying(true);
                isPlayingRef.current = true;
                setCurrentPlayingIndex(startIndex);
                
                const url = ayahs[startIndex].audio?.url;
                if (!url) {
                    playAudioSequence(startIndex + 1);
                    return;
                }

                let fullUrl = "";
                if (url.startsWith('http')) {
                    fullUrl = url;
                } else if (url.startsWith('//mirrors.quranicaudio.com/everyayah/')) {
                    fullUrl = 'https://everyayah.com/data/' + url.replace('//mirrors.quranicaudio.com/everyayah/', '');
                } else if (url.startsWith('//')) {
                    fullUrl = 'https:' + url;
                } else {
                    fullUrl = "https://audio.qurancdn.com/" + url;
                }
                
                if (audioRef.current) {
                    audioRef.current.pause();
                }
                
                audioRef.current = new Audio(fullUrl);
                audioRef.current.play();
                
                audioRef.current.onended = () => {
                    timeoutRef.current = setTimeout(() => {
                        if (isPlayingRef.current) {
                            playAudioSequence(startIndex + 1);
                        }
                    }, gap);
                };
            };

            const togglePlay = () => {
                if (isPlaying) {
                    stopAudio();
                } else {
                    playAudioSequence(0);
                }
            };

            return (
                <div className="flex-1 flex flex-col p-8 bg-white dark:bg-gray-800 m-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 h-[calc(100vh-120px)]">
                    <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-gray-700 pb-4">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Quran Reading</h2>
                            <p className="text-gray-500 dark:text-gray-400">Read the Mus'haf with translations and audio.</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <select value={gap} onChange={(e) => setGap(parseInt(e.target.value))} className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-brand text-gray-700 dark:text-gray-100">
                                <option value={0}>No Gap</option>
                                <option value={1000}>1s Gap</option>
                                <option value={2000}>2s Gap</option>
                                <option value={3000}>3s Gap</option>
                            </select>
                            <select value={reciter} onChange={handleReciterChange} className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:border-brand text-gray-700 dark:text-gray-100">
                                <option value={7}>Mishary Alafasy</option>
                                <option value={1}>AbdulBaset (Mujawwad)</option>
                                <option value={3}>Abdur-Rahman as-Sudais</option>
                                <option value={4}>Abu Bakr al-Shatri</option>
                                <option value={12}>Mahmoud Khalil Al-Husary</option>
                            </select>
                            <select value={selectedSurah} onChange={handleSurahChange} className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:outline-none focus:border-brand font-medium text-gray-700 dark:text-gray-100">
                                {surahs.map(s => <option key={s.id} value={s.id}>{s.id}. {s.name_simple}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    {isLoading ? (
                        <div className="flex-1 flex justify-center items-center text-gray-500">Loading Surah...</div>
                    ) : (
                        <div className="flex-1 overflow-y-auto pr-4 space-y-6">
                            {ayahs.map((ayah, index) => {
                                const text = ayah.text_madani || ayah.text_uthmani || "";
                                const translation = ayah.translations?.[0]?.text.replace(/<\/?[^>]+(>|$)/g, "");
                                const isCurrent = index === currentPlayingIndex;
                                
                                return (
                                    <div key={ayah.id} className={`p-6 rounded-2xl transition-colors duration-300 ${isCurrent ? 'bg-brand/10 border border-brand/20' : 'bg-gray-50 dark:bg-gray-900/50 border border-transparent'}`}>
                                        <div className="text-4xl leading-[3rem] text-right mb-4" dir="rtl" style={{ fontFamily: 'Amiri, serif' }}>
                                            <span className="text-gray-800 dark:text-gray-100">{text}</span>
                                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-brand text-brand text-sm mx-2 my-auto">{ayah.verse_number}</span>
                                        </div>
                                        {translation && (
                                            <div className="text-lg text-gray-600 dark:text-gray-400 italic">
                                                {translation}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-center">
                        <button 
                            onClick={togglePlay}
                            className={`px-8 py-3 rounded-xl font-bold text-white shadow-md transition-all flex items-center space-x-2 ${isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-[#0ea5e9] hover:bg-[#0284c7]'}`}
                        >
                            <span className="text-xl">{isPlaying ? '⏹️' : '▶️'}</span>
                            <span>{isPlaying ? 'Stop Audio' : 'Play Full Surah'}</span>
                        </button>
                    </div>
                </div>
            );
        };

        // Bismillah
        const HadithMode = ({ user, favorites, setFavorites }) => {
            const categories = ['Morning & Evening', 'Prayer (Salah)', 'Daily Life', 'Sleep & Waking', 'Hardship & Forgiveness', 'General Faith', 'My Favorites'];
            const [activeCategory, setActiveCategory] = useState(categories[0]);

            const [allHadiths] = useState(allDuas);

            const toggleFavorite = async (item) => {
                if (!user) return alert("Please log in to save favorites!");
                const isFavorited = favorites.includes(item.id);
                const userRef = doc(db, 'users', user.uid);
                
                if (isFavorited) {
                    await updateDoc(userRef, { favorites: arrayRemove(item.id) });
                    setFavorites(prev => prev.filter(id => id !== item.id));
                } else {
                    await updateDoc(userRef, { favorites: arrayUnion(item.id) });
                    setFavorites(prev => [...prev, item.id]);
                }
            };

            const playAudio = (arabicText) => {
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const utterance = new SpeechSynthesisUtterance(arabicText);
                    utterance.lang = 'ar-SA';
                    utterance.rate = 0.8;
                    window.speechSynthesis.speak(utterance);
                } else {
                    alert("Your browser doesn't support text-to-speech audio.");
                }
            };

            const filteredHadiths = activeCategory === 'My Favorites' 
                ? allHadiths.filter(h => favorites.includes(h.id))
                : allHadiths.filter(h => h.category === activeCategory);

            return (
                <div className="flex-1 flex flex-col p-8 bg-white dark:bg-gray-800 m-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-y-hidden h-[calc(100vh-120px)]">
                    <div className="flex flex-col mb-6 border-b border-gray-100 dark:border-gray-700 pb-6">
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Sunnah Reading</h2>
                            <p className="text-gray-500 dark:text-gray-400">Your Fortress of the Muslim (Hisnul Muslim). Read authentic Duas categorized by life situations.</p>
                        </div>
                        
                        {/* Category Tabs */}
                        <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setActiveCategory(category)}
                                    className={`px-6 py-3 rounded-full font-bold whitespace-nowrap transition-all shadow-sm flex items-center space-x-2 ${
                                        activeCategory === category 
                                            ? 'bg-brand text-white shadow-brand/30' 
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {category === 'My Favorites' && <IconHeart solid={activeCategory === 'My Favorites'} />}
                                    <span>{category}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-4 space-y-8 pb-10">
                        {filteredHadiths.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <IconHeart solid={false} />
                                <p className="mt-4 text-lg">You haven't saved any favorites yet.</p>
                            </div>
                        ) : (
                            filteredHadiths.map((item, idx) => {
                                const isFavorited = favorites.includes(item.id);
                                return (
                                    <div key={item.id} className="bg-gray-50 dark:bg-gray-900/50 p-8 rounded-3xl border border-gray-100 dark:border-gray-700 w-full shadow-sm hover:shadow-md transition-shadow relative group">
                                        <button 
                                            onClick={() => toggleFavorite(item)}
                                            className="absolute top-6 left-6 p-3 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 shadow-sm hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-gray-400 hover:text-red-500 focus:outline-none"
                                        >
                                            <IconHeart solid={isFavorited} />
                                        </button>
                                        
                                        <div className="text-4xl md:text-5xl mb-8 leading-loose text-right text-gray-800 dark:text-gray-100 mt-8 md:mt-0" dir="rtl" style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }}>
                                            {item.arabic}
                                        </div>

                                        <div className="text-xl md:text-2xl text-brand font-medium text-left mb-6 leading-relaxed">
                                            "{item.english}"
                                        </div>

                                        <div className="bg-brand/5 border border-brand/20 p-6 rounded-2xl w-full mb-6">
                                            <h3 className="text-brand font-bold text-lg mb-2 flex items-center space-x-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                                <span>Explanation</span>
                                            </h3>
                                            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed">
                                                {item.explanation}
                                            </p>
                                        </div>

                                        <div className="flex justify-start">
                                            <button 
                                                onClick={() => playAudio(item.arabic)}
                                                className="px-6 py-3 rounded-xl font-bold text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 transition-all flex items-center space-x-2"
                                            >
                                                <span className="text-xl">🔊</span>
                                                <span>Listen to Arabic</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            );
        };

        // Bismillah
        const NoorBuddy = ({ user, streak }) => {
            const defaultMessages = [
                { role: 'ai', text: "Assalamu Alaikum! I am your Noor Buddy. Ask me a question about Islam, or type a word like 'patience' to see what the Quran says about it." }
            ];
            
            const [messages, setMessages] = useState(defaultMessages);
            const [input, setInput] = useState('');
            const [isLoading, setIsLoading] = useState(false);
            const [hasLoaded, setHasLoaded] = useState(false);

            useEffect(() => {
                const loadHistory = async () => {
                    if (user) {
                        try {
                            const chatDocRef = doc(db, 'users', user.uid, 'private', 'chatHistory');
                            const chatSnap = await getDoc(chatDocRef);
                            if (chatSnap.exists()) {
                                const data = chatSnap.data();
                                if (data.messages && data.messages.length > 0) {
                                    setMessages(data.messages);
                                }
                            }
                        } catch (err) {
                            console.error("Error loading chat history:", err);
                        }
                    }
                    setHasLoaded(true);
                };
                loadHistory();
            }, [user]);

            useEffect(() => {
                const saveHistory = async () => {
                    if (user && hasLoaded && messages.length > 1) {
                        try {
                            const chatDocRef = doc(db, 'users', user.uid, 'private', 'chatHistory');
                            await setDoc(chatDocRef, { messages }, { merge: true });
                        } catch (err) {
                            console.error("Error saving chat history:", err);
                        }
                    }
                };
                saveHistory();
            }, [messages, user, hasLoaded]);

            const clearChat = async () => {
                if (confirm("Are you sure you want to clear your entire chat history?")) {
                    setMessages(defaultMessages);
                    if (user) {
                        try {
                            const chatDocRef = doc(db, 'users', user.uid, 'private', 'chatHistory');
                            await setDoc(chatDocRef, { messages: defaultMessages }, { merge: true });
                        } catch (err) {
                            console.error("Error clearing chat history:", err);
                        }
                    }
                }
            };

            const handleSend = async () => {
                if (!input.trim()) return;
                const userMsg = input.trim();
                const currentHistory = [...messages];
                
                setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
                setInput('');
                setIsLoading(true);

                try {
                    const userContext = user ? { name: user.displayName || 'Guest', streak: streak } : null;
                    
                    const response = await fetch(`${API_BASE_URL}/api/chat`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            message: userMsg,
                            history: currentHistory,
                            userContext: userContext
                        })
                    });

                    if (!response.ok) {
                        throw new Error('Backend not available');
                    }

                    const data = await response.json();
                    if (data.error) throw new Error(data.error);

                    setMessages(prev => [...prev, { role: 'ai', text: data.text }]);
                } catch (error) {
                    console.error("Error:", error);
                    const errorMsg = error.message && error.message !== 'Failed to fetch' 
                        ? error.message 
                        : "Oops! My backend server is not running or the AI is offline. Please make sure you started the backend server with your Gemini key!";
                    setMessages(prev => [...prev, { role: 'ai', text: errorMsg }]);
                } finally {
                    setIsLoading(false);
                }
            };

            return (
                <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden m-6 h-[calc(100vh-120px)]">
                    <div className="bg-gradient-to-r from-brand to-brand-accent p-6 text-white flex items-center justify-between shadow-sm z-10">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl shadow-inner border border-white/30">🤖</div>
                            <div>
                                <h2 className="text-xl font-bold">Noor Buddy</h2>
                                <p className="text-brand-light text-sm font-medium">Verified by Quran.com API</p>
                            </div>
                        </div>
                        <button 
                            onClick={clearChat}
                            className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10"
                        >
                            Clear Chat
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50 dark:bg-gray-900/50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${msg.role === 'user' ? 'bg-brand text-white rounded-br-sm' : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-bl-sm'}`}>
                                    <p className="leading-relaxed">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-4 shadow-sm rounded-bl-sm flex space-x-2 items-center">
                                    <div className="w-2.5 h-2.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2.5 h-2.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2.5 h-2.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex space-x-3 max-w-4xl mx-auto">
                            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask a question..." className="flex-1 px-6 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full focus:outline-none focus:border-brand text-gray-700 dark:text-gray-100"/>
                            <button onClick={handleSend} disabled={isLoading || !input.trim()} className="w-14 h-14 bg-brand text-white rounded-full flex items-center justify-center hover:bg-brand-dark shadow-md disabled:opacity-50">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        const LoginScreen = ({ onLogin }) => {
            const handleGoogleLogin = async () => {
                if (!auth || !provider) {
                    alert("Firebase is not configured yet! Please add your Firebase Config to src/lib/firebase.js");
                    return;
                }
                try {
                    await signInWithPopup(auth, provider);
                    onLogin();
                } catch (error) {
                    console.error("Login failed:", error);
                    alert("Login failed: " + error.message);
                }
            };

            return (
                <div className="flex h-screen items-center justify-center bg-brand-light/40 dark:bg-gray-900 transition-colors duration-300 w-full relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand/10 dark:bg-brand/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 -left-20 w-80 h-80 bg-brand-accent/10 dark:bg-brand-accent/5 rounded-full blur-3xl"></div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-800 p-10 rounded-3xl shadow-xl max-w-md w-full border border-gray-100 dark:border-gray-700 z-10 relative">
                        <div className="flex flex-col items-center mb-8">
                            <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-brand/30 mb-4">
                                N
                            </div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Noor AI</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-2 text-center font-medium">Your personalized Deen companion.</p>
                        </div>
                        
                        <div className="space-y-4">
                            <button 
                                onClick={handleGoogleLogin}
                                className="w-full flex items-center justify-center space-x-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-white py-3.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm font-semibold"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 48 48">
                                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                                </svg>
                                <span>Continue with Google</span>
                            </button>
                            
                            <div className="flex items-center space-x-2 my-6">
                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                                <span className="text-gray-400 text-sm font-medium">or email</span>
                                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                            </div>
                            
                            <input type="email" placeholder="Email address" className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 text-gray-800 dark:text-gray-100 transition-all" />
                            <input type="password" placeholder="Password" className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 text-gray-800 dark:text-gray-100 transition-all" />
                            
                            <button 
                                onClick={() => alert("Please use 'Continue with Google' for now!")}
                                className="w-full py-3.5 mt-2 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition-colors shadow-md hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Sign In
                            </button>
                            <button 
                                onClick={onLogin}
                                className="w-full py-2 mt-2 text-brand text-sm hover:underline"
                            >
                                Skip Login (Dev Mode)
                            </button>
                        </div>
                    </div>
                </div>
            );
        };

        const WelcomeTour = ({ onClose }) => {
            const [currentSlide, setCurrentSlide] = useState(0);
            
            const slides = [
                {
                    title: "Welcome to Noor AI ✨",
                    description: "Your personalized Deen companion. Let's take a quick tour of what you can do here!",
                    icon: "🕌"
                },
                {
                    title: "Read & Listen to Quran",
                    description: "Explore the Holy Quran with beautiful Arabic text, English translations, and audio recitation for every single Ayah.",
                    icon: "📖"
                },
                {
                    title: "Daily Sunnah & Duas",
                    description: "A digital Hisnul Muslim. Read authentic Duas categorized by life situations. Click the ❤️ to save them to your Favorites tab!",
                    icon: "📜"
                },
                {
                    title: "Meet Noor Buddy",
                    description: "Your AI Islamic assistant powered by Google Gemini and verified by Quran.com. Ask questions, get explanations, and learn about Islam safely.",
                    icon: "🤖"
                },
                {
                    title: "Track Your Progress",
                    description: "Log in every day to build your 🔥 Daily Streak and build a consistent habit of connecting with your Deen.",
                    icon: "📈"
                }
            ];

            return (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden duration-300 border border-gray-100 dark:border-gray-700">
                        <div className="p-10 flex flex-col items-center text-center">
                            <div className="text-7xl mb-6">{slides[currentSlide].icon}</div>
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">{slides[currentSlide].title}</h2>
                            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed h-24">{slides[currentSlide].description}</p>
                            
                            {/* Pagination Dots */}
                            <div className="flex space-x-2 my-8">
                                {slides.map((_, idx) => (
                                    <div key={idx} className={`h-2.5 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-brand' : 'w-2.5 bg-gray-200 dark:bg-gray-600'}`}></div>
                                ))}
                            </div>
                            
                            <div className="flex space-x-4 w-full">
                                {currentSlide > 0 && (
                                    <button 
                                        onClick={() => setCurrentSlide(c => c - 1)}
                                        className="flex-1 py-3.5 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Back
                                    </button>
                                )}
                                {currentSlide < slides.length - 1 ? (
                                    <button 
                                        onClick={() => setCurrentSlide(c => c + 1)}
                                        className="flex-[2] py-3.5 rounded-xl font-bold bg-brand text-white shadow-md hover:bg-brand-dark transition-colors"
                                    >
                                        Next
                                    </button>
                                ) : (
                                    <button 
                                        onClick={onClose}
                                        className="flex-[2] py-3.5 rounded-xl font-bold bg-brand text-white shadow-lg shadow-brand/30 hover:bg-brand-dark transition-colors hover:-translate-y-0.5"
                                    >
                                        Bismillah, Let's Go!
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        const App = () => {
            const [isAuthenticated, setIsAuthenticated] = useState(false);
            const [user, setUser] = useState(null);
            const [streak, setStreak] = useState(0);
            const [favorites, setFavorites] = useState([]);
            const [showTour, setShowTour] = useState(false);
            
            const [activeTab, setActiveTab] = useState('dashboard');
            const [isDarkMode, setIsDarkMode] = useState(() => {
                return localStorage.getItem('theme') === 'dark';
            });

            useEffect(() => {
                if (isDarkMode) {
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                } else {
                    document.documentElement.classList.remove('dark');
                    localStorage.setItem('theme', 'light');
                }
            }, [isDarkMode]);

            useEffect(() => {
                const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
                    if (currentUser) {
                        setUser(currentUser);
                        setIsAuthenticated(true);
                        
                        try {
                            const userRef = doc(db, 'users', currentUser.uid);
                            const userSnap = await getDoc(userRef);
                            
                            const today = new Date().toISOString().split('T')[0];

                            if (userSnap.exists()) {
                                const data = userSnap.data();
                                setFavorites(data.favorites || []);
                                
                                let currentStreak = data.streak || 1;
                                const lastLogin = data.lastLogin;

                                if (lastLogin !== today) {
                                    const yesterday = new Date();
                                    yesterday.setDate(yesterday.getDate() - 1);
                                    const yesterdayStr = yesterday.toISOString().split('T')[0];

                                    if (lastLogin === yesterdayStr) {
                                        currentStreak += 1;
                                    } else {
                                        currentStreak = 1;
                                    }
                                    
                                    await updateDoc(userRef, { lastLogin: today, streak: currentStreak });
                                } else if (data.streak === 0) {
                                    currentStreak = 1;
                                    await updateDoc(userRef, { streak: currentStreak });
                                }
                                setStreak(currentStreak);
                            } else {
                                // New user
                                await setDoc(userRef, {
                                    name: currentUser.displayName,
                                    email: currentUser.email,
                                    streak: 1,
                                    lastLogin: today,
                                    favorites: []
                                });
                                setStreak(1);
                                setFavorites([]);
                                setShowTour(true);
                            }
                        } catch (error) {
                            console.error("Error fetching user profile:", error);
                        }
                    } else {
                        setUser(null);
                        setIsAuthenticated(false);
                        setStreak(0);
                        setFavorites([]);
                    }
                });

                return () => unsubscribe();
            }, []);

            const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

            const handleLogout = async () => {
                await signOut(auth);
                setIsAuthenticated(false);
            };

            if (!isAuthenticated) {
                return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
            }

            return (
                <div className="flex h-screen overflow-hidden bg-brand-light/40 dark:bg-gray-900 transition-colors duration-300">
                    {showTour && <WelcomeTour onClose={() => setShowTour(false)} />}
                    <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} onLogout={handleLogout} />
                    <div className="flex-1 ml-64 flex flex-col h-screen overflow-y-auto">
                        <Topbar user={user} streak={streak} onShowTour={() => setShowTour(true)} onLogout={handleLogout} />
                        <main className="flex-1">
                            {activeTab === 'dashboard' && <MainContent setActiveTab={setActiveTab} />}
                            {activeTab === 'quran' && <QuranHub setActiveTab={setActiveTab} />}
                            {activeTab === 'quran-reading' && <ReadingMode />}
                            {activeTab === 'quran-hifz' && <HifzMode />}
                            {activeTab === 'hadith' && <HadithMode user={user} favorites={favorites} setFavorites={setFavorites} />}
                            {activeTab === 'buddy' && <NoorBuddy user={user} streak={streak} />}
                        </main>
                    </div>
                </div>
            );
        };

        
        export default App;
    