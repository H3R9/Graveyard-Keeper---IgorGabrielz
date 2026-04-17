import Markdown from 'react-markdown';
import { guideText } from '../data/gameData';

export default function Guide() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="markdown-body">
        <Markdown>{guideText}</Markdown>
      </div>
    </div>
  );
}

