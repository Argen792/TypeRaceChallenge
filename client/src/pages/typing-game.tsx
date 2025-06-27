import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Loader2, Upload, FileText, User, Trophy, Volume2, VolumeX } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { GameState, GameStats, QuoteResponse, User as UserType, TypingTest } from "@shared/schema";

export default function TypingGame() {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    startTime: null,
    currentText: "",
    userInput: "",
    currentIndex: 0,
    errors: 0,
    timeElapsed: 0,
  });

  const [gameStats, setGameStats] = useState<GameStats>({
    wpm: 0,
    accuracy: 100,
    timeElapsed: 0,
    totalCharacters: 0,
    correctCharacters: 0,
    errors: 0,
  });

  const [showResults, setShowResults] = useState(false);
  const [finalStats, setFinalStats] = useState<GameStats | null>(null);
  const [customText, setCustomText] = useState("");
  const [useCustomText, setUseCustomText] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [username, setUsername] = useState("");
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textDisplayRef = useRef<HTMLDivElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioTimeoutRef = useRef<number | null>(null);

  // Fetch random quote
  const { data: quote, isLoading, refetch } = useQuery<QuoteResponse>({
    queryKey: ["/api/quote"],
    enabled: !gameState.currentText && !useCustomText,
  });

  // Get user's best score
  const { data: bestScore } = useQuery<TypingTest | null>({
    queryKey: ["/api/typing-test/best", currentUser?.id],
    enabled: !!currentUser?.id,
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (username: string) => {
      const response = await fetch(`/api/user`, {
        method: "POST",
        body: JSON.stringify({ username }),
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        throw new Error('Failed to create user');
      }
      
      return await response.json();
    },
    onSuccess: (user: UserType) => {
      setCurrentUser(user);
      setShowUserDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/typing-test/best"] });
    },
  });

  // Save typing test mutation
  const saveTestMutation = useMutation({
    mutationFn: async (testData: any) => {
      const response = await fetch(`/api/typing-test`, {
        method: "POST",
        body: JSON.stringify(testData),
        headers: { "Content-Type": "application/json" },
      });
      
      if (!response.ok) {
        throw new Error('Failed to save test');
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/typing-test/best"] });
    },
  });

  // Initialize game with fetched quote or custom text
  useEffect(() => {
    if (useCustomText && customText && !gameState.currentText) {
      setGameState(prev => ({
        ...prev,
        currentText: customText,
      }));
    } else if (quote && !gameState.currentText && !useCustomText) {
      setGameState(prev => ({
        ...prev,
        currentText: quote.content,
      }));
    }
  }, [quote, gameState.currentText, useCustomText, customText]);

  // Timer for real-time updates
  useEffect(() => {
    if (gameState.isPlaying && gameState.startTime) {
      timerRef.current = window.setInterval(() => {
        const now = Date.now();
        const elapsed = now - gameState.startTime!;
        
        setGameState(prev => ({
          ...prev,
          timeElapsed: elapsed,
        }));

        updateStats(gameState.userInput, gameState.currentText, elapsed, gameState.errors);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.isPlaying, gameState.startTime]);

  // Load available voices and select best one
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      if (voices.length > 0 && !selectedVoice) {
        // Find the best natural voice (prefer neural/enhanced voices)
        const naturalVoices = voices.filter(voice => 
          voice.name.toLowerCase().includes('neural') ||
          voice.name.toLowerCase().includes('enhanced') ||
          voice.name.toLowerCase().includes('premium') ||
          voice.name.toLowerCase().includes('natural')
        );
        
        // If no neural voices, prefer English voices that are local (not remote)
        const englishVoices = voices.filter(voice => 
          voice.lang.startsWith('en') && voice.localService
        );
        
        // Choose the best available voice
        const bestVoice = naturalVoices[0] || englishVoices[0] || voices[0];
        setSelectedVoice(bestVoice);
      }
    };

    // Load voices immediately if available
    loadVoices();
    
    // Also listen for voiceschanged event (some browsers load voices asynchronously)
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [selectedVoice]);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  const calculateWPM = (correctCharacters: number, timeElapsed: number): number => {
    if (timeElapsed === 0) return 0;
    const minutes = timeElapsed / 60000;
    const wordsTyped = correctCharacters / 5; // Standard: 5 characters = 1 word
    return Math.round(wordsTyped / minutes) || 0;
  };

  const calculateAccuracy = (correctCharacters: number, totalCharacters: number): number => {
    if (totalCharacters === 0) return 100;
    return Math.round((correctCharacters / totalCharacters) * 100);
  };

  const updateStats = (userInput: string, targetText: string, timeElapsed: number, errors: number) => {
    const totalChars = userInput.length;
    const correctChars = totalChars - errors;
    const wpm = calculateWPM(correctChars, timeElapsed);
    const accuracy = calculateAccuracy(correctChars, totalChars);

    setGameStats({
      wpm,
      accuracy,
      timeElapsed,
      totalCharacters: totalChars,
      correctCharacters: correctChars,
      errors,
    });
  };

  const calculateTypingSpeed = (): number => {
    if (gameState.timeElapsed === 0 || gameState.userInput.length === 0) return speechRate;
    
    const charactersPerSecond = gameState.userInput.length / (gameState.timeElapsed / 1000);
    const baseSpeed = charactersPerSecond * 0.15; // Adjust multiplier for natural speech rate
    return Math.min(Math.max(baseSpeed, 0.5), 3.0); // Clamp between 0.5x and 3x speed
  };

  const playAudioForProgress = () => {
    if (!audioEnabled || !('speechSynthesis' in window) || !gameState.currentText) return;

    const currentPos = gameState.userInput.length;
    if (currentPos >= gameState.currentText.length) return;

    // Stop any current speech
    window.speechSynthesis.cancel();
    
    // Get remaining text to read
    const remainingText = gameState.currentText.substring(currentPos);
    
    // Read ahead in complete words (next 15-25 words or until sentence end)
    const words = remainingText.split(/\s+/);
    const maxWords = 20;
    let wordsToRead = Math.min(words.length, maxWords);
    
    // Find natural stopping point (sentence endings)
    for (let i = 0; i < wordsToRead; i++) {
      if (words[i].match(/[.!?]$/)) {
        wordsToRead = i + 1;
        break;
      }
    }
    
    const textChunk = words.slice(0, wordsToRead).join(' ');
    
    if (textChunk.trim()) {
      const utterance = new SpeechSynthesisUtterance(textChunk);
      
      // Use selected voice for better quality
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      // Improved speech settings for more natural sound
      utterance.rate = calculateTypingSpeed();
      utterance.pitch = 0.9; // Slightly lower pitch sounds more natural
      utterance.volume = 0.7;
      
      // Add some variation to make it less robotic
      const variation = (Math.random() - 0.5) * 0.1;
      utterance.pitch += variation;
      
      speechSynthRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopAudio = () => {
    window.speechSynthesis.cancel();
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
      audioTimeoutRef.current = null;
    }
  };

  const startGame = () => {
    if (!gameState.currentText) return;
    
    setGameState(prev => ({
      ...prev,
      isPlaying: true,
      startTime: Date.now(),
      userInput: "",
      currentIndex: 0,
      errors: 0,
      timeElapsed: 0,
    }));

    setGameStats({
      wpm: 0,
      accuracy: 100,
      timeElapsed: 0,
      totalCharacters: 0,
      correctCharacters: 0,
      errors: 0,
    });

    // Focus the textarea and scroll to top of text
    setTimeout(() => {
      textareaRef.current?.focus();
      
      // Scroll text display to top when starting
      if (textDisplayRef.current) {
        textDisplayRef.current.scrollTop = 0;
      }

      // Start audio if enabled
      if (audioEnabled) {
        playAudioForProgress();
      }
    }, 100);
  };

  const resetGame = async () => {
    // Stop any audio first
    stopAudio();

    setGameState({
      isPlaying: false,
      startTime: null,
      currentText: "",
      userInput: "",
      currentIndex: 0,
      errors: 0,
      timeElapsed: 0,
    });

    setGameStats({
      wpm: 0,
      accuracy: 100,
      timeElapsed: 0,
      totalCharacters: 0,
      correctCharacters: 0,
      errors: 0,
    });

    setShowResults(false);
    setFinalStats(null);

    // Fetch new quote only if not using custom text
    if (!useCustomText) {
      await refetch();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setCustomText(text.trim());
      setUseCustomText(true);
      setGameState(prev => ({
        ...prev,
        currentText: text.trim(),
      }));
    };
    reader.readAsText(file);
  };

  const handleCustomTextSubmit = () => {
    if (customText.trim()) {
      setUseCustomText(true);
      setGameState(prev => ({
        ...prev,
        currentText: customText.trim(),
      }));
    }
  };

  const switchToRandomText = () => {
    setUseCustomText(false);
    setCustomText("");
    setGameState(prev => ({
      ...prev,
      currentText: "",
    }));
    refetch();
  };

  const handleTyping = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!gameState.isPlaying) return;

    const input = event.target.value;
    let errors = 0;

    // Count errors
    for (let i = 0; i < input.length; i++) {
      if (input[i] !== gameState.currentText[i]) {
        errors++;
      }
    }

    setGameState(prev => ({
      ...prev,
      userInput: input,
      errors,
    }));

    // Auto-scroll to keep current position visible
    setTimeout(() => {
      if (currentCharRef.current && textDisplayRef.current) {
        currentCharRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'nearest'
        });
      }
    }, 0);

    // Sync audio with typing progress (every few characters)
    if (audioEnabled && input.length > 0 && input.length % 10 === 0) {
      playAudioForProgress();
    }

    // Check if completed
    if (input.length === gameState.currentText.length) {
      endGame(input, errors);
    }
  };

  const endGame = (finalInput: string, finalErrors: number) => {
    // Stop audio when game ends
    stopAudio();

    setGameState(prev => ({
      ...prev,
      isPlaying: false,
    }));

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const finalTimeElapsed = Date.now() - gameState.startTime!;
    const totalChars = finalInput.length;
    const correctChars = totalChars - finalErrors;
    const finalWPM = calculateWPM(correctChars, finalTimeElapsed);
    const finalAccuracy = calculateAccuracy(correctChars, totalChars);

    const final: GameStats = {
      wpm: finalWPM,
      accuracy: finalAccuracy,
      timeElapsed: finalTimeElapsed,
      totalCharacters: totalChars,
      correctCharacters: correctChars,
      errors: finalErrors,
    };

    setFinalStats(final);
    setShowResults(true);

    // Save test result to database if user is logged in
    if (currentUser) {
      const testData = {
        userId: currentUser.id,
        wpm: finalWPM.toString(),
        accuracy: finalAccuracy.toString(),
        timeElapsed: finalTimeElapsed,
        totalCharacters: totalChars,
        correctCharacters: correctChars,
        errors: finalErrors,
        textSource: useCustomText ? "custom" : "random",
        textContent: gameState.currentText,
      };
      
      saveTestMutation.mutate(testData);
    }
  };

  const handleCreateUser = () => {
    if (username.trim()) {
      createUserMutation.mutate(username.trim());
      setUsername("");
    }
  };

  const renderTextWithHighlighting = () => {
    if (!gameState.currentText) return null;

    return (
      <div className="typing-text text-gray-800 leading-relaxed">
        {gameState.currentText.split("").map((char, index) => {
          let className = "relative";
          const isCurrentChar = index === gameState.userInput.length;
          
          if (index < gameState.userInput.length) {
            if (gameState.userInput[index] === char) {
              className += " char-correct";
            } else {
              className += " char-incorrect";
            }
          } else if (isCurrentChar) {
            className += " char-current";
          }

          return (
            <span 
              key={index} 
              className={className}
              ref={isCurrentChar ? currentCharRef : null}
            >
              {char}
            </span>
          );
        })}
      </div>
    );
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">TypeRace</h1>
              <p className="text-gray-600">Test your typing speed and accuracy</p>
            </div>
            
            <div className="flex items-center gap-4">
              {currentUser ? (
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="w-5 h-5" />
                      <span className="font-semibold">{currentUser.username}</span>
                    </div>
                    {bestScore && (
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <Trophy className="w-4 h-4 text-yellow-600" />
                        <span>Best: {bestScore.wpm} WPM</span>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={() => setCurrentUser(null)}
                    variant="outline"
                    size="sm"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowUserDialog(true)}
                  variant="default"
                  className="flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Login/Register
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Game Container */}
        <Card className="p-8 mb-6">
          {/* Text Source Selection */}
          <Tabs value={useCustomText ? "custom" : "random"} className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="random" onClick={switchToRandomText}>
                <FileText className="w-4 h-4 mr-2" />
                Random Text
              </TabsTrigger>
              <TabsTrigger value="custom" onClick={() => setUseCustomText(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Your Text
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">Upload a text file (.txt)</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".txt,.pdf"
                    onChange={handleFileUpload}
                    ref={fileInputRef}
                    className="mt-2"
                  />
                </div>
                <div className="text-center text-gray-500">or</div>
                <div>
                  <Label htmlFor="custom-text">Paste your text here</Label>
                  <Textarea
                    id="custom-text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Paste the text you want to practice typing..."
                    className="mt-2 min-h-24"
                  />
                  <Button 
                    onClick={handleCustomTextSubmit}
                    className="mt-2"
                    disabled={!customText.trim()}
                  >
                    Use This Text
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Audio Controls */}
          <Card className="p-4 mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                  {audioEnabled ? <Volume2 className="w-5 h-5 text-blue-600" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                  <div className="flex items-center gap-2">
                    <Label htmlFor="audio-toggle" className="text-sm font-medium">
                      Audio Sync
                    </Label>
                    <Switch
                      id="audio-toggle"
                      checked={audioEnabled}
                      onCheckedChange={setAudioEnabled}
                    />
                  </div>
                </div>
                
                {audioEnabled && (
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Label className="text-sm font-medium whitespace-nowrap">
                      Base Speed
                    </Label>
                    <div className="flex items-center gap-2 flex-1">
                      <Slider
                        value={[speechRate]}
                        onValueChange={(value) => setSpeechRate(value[0])}
                        min={0.5}
                        max={2.0}
                        step={0.1}
                        className="flex-1"
                      />
                      <span className="text-sm text-gray-600 w-12 text-right">
                        {speechRate.toFixed(1)}x
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {audioEnabled && availableVoices.length > 0 && (
                <div className="flex items-center gap-3">
                  <Label className="text-sm font-medium whitespace-nowrap">
                    Voice
                  </Label>
                  <Select
                    value={selectedVoice?.name || ""}
                    onValueChange={(voiceName) => {
                      const voice = availableVoices.find(v => v.name === voiceName);
                      if (voice) setSelectedVoice(voice);
                    }}
                  >
                    <SelectTrigger className="w-full max-w-xs">
                      <SelectValue placeholder="Select a voice" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVoices
                        .filter(voice => voice.lang.startsWith('en'))
                        .map((voice) => (
                          <SelectItem key={voice.name} value={voice.name}>
                            {voice.name} {voice.localService ? '(Local)' : '(Online)'}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            {audioEnabled && (
              <p className="text-xs text-gray-500 mt-2">
                Audio reads the text at your typing speed with natural voice variations. Select a voice for better quality.
              </p>
            )}
          </Card>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {Math.floor(gameStats.timeElapsed / 1000)}
              </div>
              <div className="text-sm text-gray-600">Time (s)</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {gameStats.wpm}
              </div>
              <div className="text-sm text-gray-600">WPM</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {gameStats.accuracy}%
              </div>
              <div className="text-sm text-gray-600">Accuracy</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-gray-700">
                {gameState.userInput.length}/{gameState.currentText.length}
              </div>
              <div className="text-sm text-gray-600">Progress</div>
            </div>
          </div>

          {/* Text Display Area */}
          <div className="mb-6">
            <div 
              ref={textDisplayRef}
              className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 min-h-32 max-h-64 overflow-y-auto scroll-smooth"
              style={{ scrollBehavior: 'smooth' }}
            >
              {isLoading && !useCustomText ? (
                <div className="text-center py-8">
                  <Loader2 className="animate-spin inline-block w-6 h-6 text-blue-500 mb-2" />
                  <p className="text-gray-600">Loading new passage...</p>
                </div>
              ) : gameState.currentText ? (
                renderTextWithHighlighting()
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {useCustomText ? "Please add your text above to start practicing" : "Loading text..."}
                </div>
              )}
            </div>
          </div>

          {/* Typing Input Area */}
          <div className="mb-6">
            <Textarea
              ref={textareaRef}
              value={gameState.userInput}
              onChange={handleTyping}
              placeholder="Click here and start typing when ready..."
              className="w-full h-32 p-4 font-mono text-lg resize-none"
              disabled={!gameState.isPlaying}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={startGame}
              disabled={gameState.isPlaying || isLoading || !gameState.currentText}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              {gameState.isPlaying ? "Playing..." : "Start Test"}
            </Button>
            <Button
              onClick={resetGame}
              variant="secondary"
              className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold"
            >
              Reset
            </Button>
          </div>
        </Card>

        {/* Instructions Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">How to Play</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Choose between random text passages or upload your own text/files
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Click "Start Test" to begin typing practice
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Type the text exactly as shown, including punctuation and spaces
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-green-600 font-semibold">Green</span> characters are correct, <span className="text-red-500 font-semibold">red</span> are incorrect
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Complete the passage to see your final WPM and accuracy scores
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Enable audio sync to hear the text read aloud at your typing speed
            </li>
          </ul>
        </Card>
      </div>

      {/* Results Modal */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-md w-full p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Complete!</h2>
            <p className="text-gray-600 mb-6">Great job! Here are your results:</p>
            
            {finalStats && (
              <div className="space-y-4 mb-8">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {finalStats.wpm}
                  </div>
                  <div className="text-sm text-gray-600">Words Per Minute</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="text-xl font-bold text-green-600">
                      {finalStats.accuracy}%
                    </div>
                    <div className="text-xs text-gray-600">Accuracy</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xl font-bold text-gray-700">
                      {formatTime(finalStats.timeElapsed)}
                    </div>
                    <div className="text-xs text-gray-600">Time</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={resetGame}
                className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                Try Again
              </Button>
              <Button
                onClick={() => setShowResults(false)}
                variant="secondary"
                className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Login/Register Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-md w-full p-6">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              Welcome to TypeRace
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-center text-gray-600">
              Enter your username to save your typing progress and track your best scores!
            </p>
            
            <div className="space-y-3">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateUser();
                  }
                }}
              />
            </div>
            
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleCreateUser}
                disabled={!username.trim() || createUserMutation.isPending}
                className="flex-1"
              >
                {createUserMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Start Playing"
                )}
              </Button>
              <Button
                onClick={() => setShowUserDialog(false)}
                variant="outline"
                className="flex-1"
              >
                Play as Guest
              </Button>
            </div>
            
            <p className="text-xs text-center text-gray-500 mt-4">
              * Playing as a guest means your scores won't be saved
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
