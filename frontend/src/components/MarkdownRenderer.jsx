import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Sparkles, Terminal } from 'lucide-react';

// Vibrant syntax highlighter tokenizer
const highlightSyntax = (code, language) => {
  if (!code) return code;

  // Split into lines for syntax highlighting & line numbering
  const lines = code.split('\n');
  const lang = (language || '').toLowerCase();

  const keywords = new Set([
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
    'class', 'import', 'export', 'from', 'default', 'async', 'await', 'try',
    'catch', 'finally', 'throw', 'new', 'this', 'super', 'extends', 'typeof',
    'instanceof', 'def', 'elif', 'lambda', 'with', 'as', 'pass', 'raise',
    'yield', 'public', 'private', 'protected', 'static', 'interface', 'implements',
    'enum', 'type', 'select', 'from', 'where', 'insert', 'update', 'delete',
    'join', 'group', 'order', 'by', 'having', 'limit', 'into', 'values'
  ]);

  const booleansAndConstants = new Set([
    'true', 'false', 'null', 'undefined', 'nil', 'none', 'true', 'false',
    'nan', 'infinity', 'self'
  ]);

  return lines.map((line, lineIdx) => {
    // Regex for basic tokens: comments, strings, words, numbers, operators
    const tokenRegex = /(\/\/.*$|#.*$|\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b\d+(?:\.\d+)?\b|\b[a-zA-Z_$][a-zA-Z0-9_$]*\b|[=!<>+\-*/%&|^~:]+|\s+)/g;
    const tokens = [];
    let match;
    let lastIndex = 0;

    while ((match = tokenRegex.exec(line)) !== null) {
      const token = match[0];

      // Comment
      if (token.startsWith('//') || token.startsWith('#') || token.startsWith('/*')) {
        tokens.push(
          <span key={match.index} className="text-purple-300/80 italic font-medium">
            {token}
          </span>
        );
      }
      // String
      else if (
        (token.startsWith('"') && token.endsWith('"')) ||
        (token.startsWith("'") && token.endsWith("'")) ||
        (token.startsWith('`') && token.endsWith('`'))
      ) {
        tokens.push(
          <span key={match.index} className="text-emerald-300 font-normal">
            {token}
          </span>
        );
      }
      // Number
      else if (/^\d+(?:\.\d+)?$/.test(token)) {
        tokens.push(
          <span key={match.index} className="text-amber-300 font-semibold">
            {token}
          </span>
        );
      }
      // Keyword
      else if (keywords.has(token.toLowerCase())) {
        tokens.push(
          <span key={match.index} className="text-pink-400 font-bold tracking-tight">
            {token}
          </span>
        );
      }
      // Boolean / Constant
      else if (booleansAndConstants.has(token.toLowerCase())) {
        tokens.push(
          <span key={match.index} className="text-cyan-300 font-semibold">
            {token}
          </span>
        );
      }
      // Function call (followed by '(')
      else if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(token) && line.slice(match.index + token.length).trim().startsWith('(')) {
        tokens.push(
          <span key={match.index} className="text-sky-300 font-semibold">
            {token}
          </span>
        );
      }
      // Operators
      else if (/^[=!<>+\-*/%&|^~:]+$/.test(token)) {
        tokens.push(
          <span key={match.index} className="text-fuchsia-300 font-medium">
            {token}
          </span>
        );
      }
      // Default
      else {
        tokens.push(
          <span key={match.index} className="text-slate-200">
            {token}
          </span>
        );
      }
    }

    return (
      <div key={lineIdx} className="table-row group/line hover:bg-slate-800/40 transition-colors">
        <span className="table-cell pr-4 text-right select-none text-[10px] text-slate-500/70 font-mono w-7">
          {lineIdx + 1}
        </span>
        <span className="table-cell font-mono text-xs leading-relaxed">
          {tokens.length > 0 ? tokens : ' '}
        </span>
      </div>
    );
  });
};

const CodeBlock = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const textContent = String(children).replace(/\n$/, '');

  const isInline = inline || (!match && !String(children).includes('\n'));

  const handleCopy = () => {
    navigator.clipboard.writeText(textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isInline) {
    return (
      <code
        className="font-mono text-xs px-2 py-0.5 rounded-md bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 text-indigo-700 border border-purple-200/80 font-semibold inline-block my-0.5 align-baseline shadow-2xs"
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className="my-3.5 rounded-2xl border border-indigo-500/30 overflow-hidden bg-gradient-to-b from-slate-950 via-[#0d1117] to-slate-950 text-slate-100 shadow-lg shadow-indigo-500/10 transition-all hover:border-indigo-500/50">
      {/* Adorable macOS Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 backdrop-blur-xs border-b border-indigo-500/20 text-xs">
        <div className="flex items-center gap-2">
          {/* macOS Traffic Lights with subtle glow */}
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 shadow-xs shadow-rose-500/50 hover:opacity-80 transition-opacity" />
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-xs shadow-amber-400/50 hover:opacity-80 transition-opacity" />
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-xs shadow-emerald-400/50 hover:opacity-80 transition-opacity" />
          </div>

          {/* Cute Colorful Language Pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-indigo-500/20 border border-pink-500/30 text-pink-300 text-[10px] font-bold tracking-wider uppercase font-mono shadow-2xs">
            <Terminal className="w-3 h-3 text-pink-400" />
            <span>{language || 'code'}</span>
          </div>
        </div>

        {/* Cute Vibrant Copy Pill */}
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer bg-slate-800/80 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700 hover:border-indigo-400 shadow-2xs"
          title="Copy snippet"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300 animate-bounce" />
              <span className="text-emerald-300 font-semibold">Copied! ✨</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3 text-pink-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Colorful Code Body */}
      <div className="p-4 overflow-x-auto">
        <div className="table min-w-full">
          {highlightSyntax(textContent, language)}
        </div>
      </div>
    </div>
  );
};

const MarkdownRenderer = ({ content }) => {
  if (!content) return null;

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-slate-900 mt-4 mb-2 pb-1.5 border-b border-slate-200 tracking-tight first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-slate-900 mt-3.5 mb-2 pb-1 border-b border-slate-100 tracking-tight">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mt-3 mb-1.5">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-2.5 last:mb-0">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-4 mb-2.5 space-y-1 text-xs sm:text-sm text-slate-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-4 mb-2.5 space-y-1 text-xs sm:text-sm text-slate-700 font-mono">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-xs sm:text-sm text-slate-700 leading-relaxed pl-1 font-sans">
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-2.5 pl-3.5 py-2 border-l-3 border-indigo-500 bg-indigo-50/50 rounded-r-md text-xs sm:text-sm text-slate-700 italic">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-3 border-t border-slate-200" />,
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-md border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50 font-mono text-[10px] uppercase text-slate-600 font-semibold">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
          ),
          tr: ({ children }) => <tr>{children}</tr>,
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold text-slate-900">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-slate-700">{children}</td>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-slate-900">{children}</strong>
          ),
          code: CodeBlock,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
