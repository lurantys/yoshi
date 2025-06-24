import React from 'react';

const WelcomeSection: React.FC = () => {
  return (
    <div className="text-center py-16 px-4">
      <h2 className="text-4xl md:text-5xl font-extrabold text-text-primary mb-4">
        What mood defines your perfect playlist?
      </h2>
      <p className="text-text-secondary max-w-2xl mx-auto">
        Tell us how you're feeling, what you're doing, or the vibe you're going for, and we'll create the perfect Spotify playlist just for you.
      </p>
    </div>
  );
};

export default WelcomeSection; 