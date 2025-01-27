'use client';

import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FaHeart } from "react-icons/fa";


export default function Home() {
  const [wordList, setWordList] = useState([]); // List of all words
  const [hint, setHint] = useState(''); // Hint substring
  const [guess, setGuess] = useState('');
  const [validWords, setValidWords] = useState([]); // List of valid words based on the hint
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const fetchWordList = async () => {
    try {
      const response = await fetch('/words.txt'); // Fetch the words.txt file
      const text = await response.text(); // Get the text content
      const words = text.split('\n').map((word) => word.trim().toLowerCase()); // Split into an array of words
      setWordList(words);
    } catch (error) {
      console.error('Error fetching words:', error);
    }
  };

  const getHint = () => {
    if (wordList.length === 0) return;
    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    const randomIndex = Math.floor(Math.random() * (randomWord.length - 2)); // Ensure the substring is at least 2 characters
    const hintSubstring = randomWord.slice(randomIndex, randomIndex + 2); // Get a substring of length 2
    setHint(hintSubstring);

    // Filter valid words that contain the hint
    const validWordsForHint = wordList.filter((word) => word.includes(hintSubstring));
    setValidWords(validWordsForHint);
  };

  const checkGuess = () => {
    if (validWords.some((word) => word.toLowerCase() === guess.toLowerCase())) {
      toast.success('Correct.');
      nextRound();
    } else {
      toast.error('Wrong guess! Try again.');
      setGuess(''); // Clear the guess input
    }
  };

  const nextRound = () => {
    const newTimeLeft = Math.floor(Math.random() * (20 - 10 + 1)) + 10; // Generate new time
    setGuess('');
    setTimeLeft(newTimeLeft); // Reset timer
    getHint(); // Generate a new hint
  };

  useEffect(() => {
    if (timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearTimeout(timer); // Cleanup the timer
    } else if (timeLeft === 0 && lives > 0) {
      setLives((prevLives) => {
        const updatedLives = prevLives - 1;
        if (updatedLives === 0) {
          setGameOver(true); // End the game
        } else {
          nextRound(); // Start the next round
        }
        return updatedLives;
      });
    }
  }, [timeLeft, lives, gameOver]);

  const currentLives = Array.from({ length: lives }, (_, index) => (
    <FaHeart key={index} className="text-red-600 mx-1 text-2xl" />
  ));

  useEffect(() => {
    fetchWordList(); // Fetch the words once when the component mounts
  }, []);

  useEffect(() => {
    if (wordList.length > 0) {
      nextRound();
    }
  }, [wordList]);

  return (
    
    <div className="min-h-screen md:h-screen md:py-20 flex flex-col items-center justify-center bg-green-200 text-gray-900 font-bold">
      <h1 className="text-4xl text-center mx-6 mb-6 uppercase">Word Guessing Game</h1>
      <div className="p-8 border-4 mx-6 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
        {!gameOver ? (
          <>
            <div className='flex justify-between items-center mb-4'>
            <p> Time left : {timeLeft}</p>
              <p className="flex text-lg">{currentLives}</p>
            </div>
            <p className="text-lg mb-4">
              Hint: <span className="bg-black text-green-200 px-2">{hint}</span>
            </p>
            <input
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              className="border-2 border-black px-4 py-2 text-lg w-full mb-4 focus:outline-none shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
              placeholder="Type your guess here..."
            />
            <button
              onClick={checkGuess}
              className="bg-black w-full text-green-200 px-6 py-3 uppercase shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-gray-800"
            >
              Submit
            </button>
            <Toaster />
          </>
        ) : (
          <p className="text-red-600 text-2xl">Game Over!</p>
        )}
      </div>
    </div>
  );
}
