import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import WelcomeSection from './components/WelcomeSection';
import MainInput from './components/MainInput';
import SuggestionCards from './components/SuggestionCards';
import Footer from './components/Footer';

function App() {
  const [prompt, setPrompt] = useState('');

  const handleGeneratePlaylist = () => {
    if (!prompt.trim()) return;
    console.log('Generating playlist for mood:', prompt);
    // You can add your API call logic here.
    // setPrompt(''); // Optionally clear the prompt after submission
  };

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen bg-primary">
        <Header />
        <main className="flex-grow flex flex-col justify-center">
          <WelcomeSection />
          <MainInput 
            prompt={prompt}
            onPromptChange={setPrompt}
            onSubmit={handleGeneratePlaylist}
          />
          <SuggestionCards onSuggestionClick={setPrompt} />
        </main>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default App;
