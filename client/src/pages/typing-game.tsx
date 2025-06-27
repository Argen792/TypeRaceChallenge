import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, Loader2, Upload, FileText } from "lucide-react";
import type { GameState, GameStats, QuoteResponse } from "@shared/schema";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch random quote
  const { data: quote, isLoading, refetch } = useQuery<QuoteResponse>({
    queryKey: ["/api/quote"],
    enabled: !gameState.currentText && !useCustomText,
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

    // Focus the textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  const resetGame = async () => {
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

    // Check if completed
    if (input.length === gameState.currentText.length) {
      endGame(input, errors);
    }
  };

  const endGame = (finalInput: string, finalErrors: number) => {
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
  };

  const renderTextWithHighlighting = () => {
    if (!gameState.currentText) return null;

    return (
      <div className="typing-text text-gray-800">
        {gameState.currentText.split("").map((char, index) => {
          let className = "relative";
          
          if (index < gameState.userInput.length) {
            if (gameState.userInput[index] === char) {
              className += " char-correct";
            } else {
              className += " char-incorrect";
            }
          } else if (index === gameState.userInput.length) {
            className += " char-current";
          }

          return (
            <span key={index} className={className}>
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
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">TypeRace</h1>
          <p className="text-gray-600">Test your typing speed and accuracy</p>
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
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6 min-h-32">
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
    </div>
  );
}
