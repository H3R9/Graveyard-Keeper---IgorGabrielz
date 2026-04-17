import Markdown from 'react-markdown';
import { BookOpen } from 'lucide-react';
import { advancedGuideText } from '../data/gameData';

export default function AdvancedGuide() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-center space-x-3 mb-6 border-b-4 border-border-dark pb-2">
        <BookOpen className="text-accent-red" size={32} />
        <h2 className="text-4xl text-accent-red text-shadow-md">
          Tomo Proibido
        </h2>
      </div>
      
      <div className="markdown-body bg-[rgba(0,0,0,0.5)] border-4 border-border-dark p-8">
        <Markdown>{advancedGuideText}</Markdown>
      </div>
    </div>
  );
}
